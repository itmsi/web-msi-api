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
  baseResponse, decodeToken
} = require('../../utils')

const store = async (req, res) => {
  const payload = { ...req?.body, ...decodeToken('created', req) }
  const result = await repository.create(payload)
  return baseResponse(res, result)
}

module.exports = {
  store,
}
