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
  baseResponse, paginationResponse, requestHttp,
  dynamicFilterJoin, paging, generatePassword, isValidPassword,
  decodeToken,
  ROLE
} = require('../../utils')

const store = async (req, res) => {
  let payload = { ...req?.body, ...decodeToken('created', req) }
  payload = generatePassword(payload)
  const result = await repository.create(payload)
  return baseResponse(res, result)
}

const fetch = async (req, res) => {
  const where = dynamicFilterJoin(req, repository.COLUMN)
  const filter = paging(req, repository.DEFAULT_SORT)
  const result = await repository.get(where, filter)
  return paginationResponse(req, res, result)
}

const fetchByParam = async (req, res) => {
  const where = requestHttp(req)
  const result = await repository.getByParam(where)
  return baseResponse(res, result)
}

const update = async (req, res) => {
  const where = requestHttp(req)
  let payload = { ...req?.body, type_method: 'update', ...decodeToken('updated', req) }
  if (req?.body?.password) {
    payload = generatePassword(payload)
  }
  const result = await repository.update(where, payload)
  return baseResponse(res, result)
}

const softDelete = async (req, res) => {
  const where = requestHttp(req)
  const payload = { type_method: 'soft-delete', ...decodeToken('deleted', req) }
  const result = await repository.update(where, payload, 'username')
  return baseResponse(res, result)
}

const changePassword = async (req, res) => {
  const { users_id } = decodeToken('default', req);
  const where = { users_id }

  const row = await repository.getByParam(
    where,
    ['mst_users.users_id',
      'mst_users.password',
      'mst_users.salt'
    ]
  )

  if (row?.data?.data.length !== 0) {
    const pwd = row.data.data.password
    const checkPassword = isValidPassword(req?.body?.old_password, pwd, row.data.data.salt)
    if (!checkPassword) {
      return baseResponse(res, { code: 201, data: { status: false, message: 'Old Password wrong', data: [] } })
    }
  } else {
    return baseResponse(res, { code: 201, data: { status: false, message: 'data ID not found', data: [] } })
  }

  delete req.body.old_password
  let payload = { ...req?.body, type_method: 'update', ...decodeToken('updated', req) }
  payload = generatePassword(payload)
  const result = await repository.update(where, payload)
  return baseResponse(res, result)
}

const fetchAuctionOfficer = async (req, res) => {
  const filter = paging(req, repository.DEFAULT_SORT)
  const where = dynamicFilterJoin(req, repository.COLUMN)

  where.role_name = ROLE.AUCTION_OFFICER
  where.status = 1

  const result = await repository.getAuctionOfficer(where, filter)

  return baseResponse(res, result)
}

module.exports = {
  store,
  fetch,
  fetchByParam,
  update,
  softDelete,
  changePassword,
  fetchAuctionOfficer
}
