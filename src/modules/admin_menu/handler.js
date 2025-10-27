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
const { baseResponse, dynamicFilter } = require('../../utils')

const fetch = async (req, res) => {
  const where = dynamicFilter(req, repository.COLUMN)
  const result = await repository.get(where)
  return baseResponse(res, result)
}

const fetchAccess = async (req, res) => {
  const result = await repository.getAccess(req)
  return baseResponse(res, result)
}

module.exports = {
  fetch,
  fetchAccess
}
