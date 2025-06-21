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
  baseResponse,
  paginationResponse,
  requestHttp,
  paging,
  decodeToken
} = require('../../utils')

const storeImport = async (req, res) => {
  try {
    const payload = { ...req?.body, ...decodeToken('created', req) }
    const result = await repository.createOrUpdate(payload)
    return baseResponse(res, result)
  } catch (error) {
    error.path = __filename
    return baseResponse(res, { code: 500, data: { status: false, message: error.message } })
  }
}

const store = async (req, res) => {
  try {
    const payload = { ...req?.body, ...decodeToken('created', req) }
    const result = await repository.create(payload)
    return baseResponse(res, result)
  } catch (error) {
    error.path = __filename
    return baseResponse(res, { code: 500, data: { status: false, message: error.message } })
  }
}

const fetch = async (req, res) => {
  try {
    const where = req.query
    const filter = paging(req, repository.DEFAULT_SORT)
    const result = await repository.get(where, filter)
    return paginationResponse(req, res, result)
  } catch (error) {
    error.path = __filename
    return baseResponse(res, { code: 500, data: { status: false, message: error.message } })
  }
}

const fetchByParam = async (req, res) => {
  try {
    const where = requestHttp(req)
    const result = await repository.getByParam(where)
    return baseResponse(res, result)
  } catch (error) {
    error.path = __filename
    return baseResponse(res, { code: 500, data: { status: false, message: error.message } })
  }
}

const update = async (req, res) => {
  try {
    const where = requestHttp(req)
    const payload = { ...req?.body, type_method: 'update', ...decodeToken('updated', req) }
    const result = await repository.update(where, payload)
    return baseResponse(res, result)
  } catch (error) {
    error.path = __filename
    return baseResponse(res, { code: 500, data: { status: false, message: error.message } })
  }
}

const softDelete = async (req, res) => {
  try {
    const where = requestHttp(req)
    const payload = { type_method: 'soft-delete', ...decodeToken('deleted', req) }
    const result = await repository.update(where, payload)
    return baseResponse(res, result)
  } catch (error) {
    error.path = __filename
    return baseResponse(res, { code: 500, data: { status: false, message: error.message } })
  }
}

module.exports = {
  store,
  storeImport,
  fetch,
  fetchByParam,
  update,
  softDelete
}
