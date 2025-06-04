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
  paginationResponse, paging
} = require('../../utils')

const fetch = async (req, res) => {
  const where = req.query; // dynamicFilterJoin(req, repository.COLUMN)
  const filter = paging(req, repository.DEFAULT_SORT)
  const result = await repository.get(where, filter)
  return paginationResponse(req, res, result)
}

module.exports = {
  fetch
}
