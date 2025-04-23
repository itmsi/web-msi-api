/**
 *
 * @param {*} lang this is for consisent with other language message
 * @param {*} repository this is repository for postgres definition
 * @param {*} req express request you can see with console.log(req)
 * @param {*} res express response you can see with console.log(req)
 * @param {*} requestHttp if request condition is and operator, you can use this
 * @return {JSON}
*/

const repository = require('./postgre_repository')
const {
  baseResponse, paginationResponse, requestHttp, dynamicFilter, paging, generateUpload, decodeToken,
  generateUploadUpdated
} = require('../../utils')

const store = async (req, res) => {
  const payload = { ...req?.body, ...decodeToken('created', req) }
  const { pathForDatabase } = await generateUpload(req, 0, 'images/banks', 'banks')
  payload.bank_image = pathForDatabase ? `${pathForDatabase}` : ''
  const result = await repository.create(payload);
  return baseResponse(res, result)
}

const fetch = async (req, res) => {
  const where = dynamicFilter(req, repository.COLUMN)
  const filter = paging(req, repository.DEFAULT_SORT)
  const result = await repository.get(where, filter)
  return paginationResponse(req, res, result)
}

const fetchPublic = async (req, res) => {
  const where = dynamicFilter(req, repository.COLUMN)
  const filter = paging(req, repository.DEFAULT_SORT)
  const COLUMN = [
    'id', 'description', 'bank_code_midtrans', 'admin_fee', 'status', 'bank_image',
    'created_at', 'updated_at', 'deleted_at',
  ]
  const result = await repository.getPublic(where, filter, COLUMN)
  return baseResponse(res, result)
}

const fetchByParam = async (req, res) => {
  const where = requestHttp(req)
  const result = await repository.getByParam(where)
  return baseResponse(res, result)
}

const update = async (req, res) => {
  const where = requestHttp(req)
  where.deleted_at = null
  let payload = { ...req?.body, type_method: 'update', ...decodeToken('updated', req) }
  if (req?.files) {
    const column = ['bank_image']
    const rows = await repository.getByParam(where, column)
    const defImg = { num: 0, path: 'images/banks', name: 'banks' }
    const defImgRow = {
      column: rows?.data?.data?.bank_image, payloadName: column[0], payload
    }
    payload = await generateUploadUpdated(req, defImg, defImgRow)
  }
  const result = await repository.update(where, payload)
  return baseResponse(res, result)
}

const softDelete = async (req, res) => {
  const where = requestHttp(req)
  const payload = { type_method: 'soft-delete', ...decodeToken('deleted', req) }
  where.deleted_at = null
  const result = await repository.update(where, payload, 'deskripsi')
  return baseResponse(res, result)
}

module.exports = {
  store,
  fetch,
  fetchPublic,
  fetchByParam,
  update,
  softDelete
}
