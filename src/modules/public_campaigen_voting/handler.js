/**
 * Public Campaigen Voting Handler
 */

const repository = require('../campaigen_voting/postgre_repository')
const {
  paging, paginationResponsePublic
} = require('../../utils')

const fetchPublic = async (req, res) => {
  const where = req.query
  const filter = paging(req, repository.DEFAULT_SORT)
  const result = await repository.get(where, filter)
  return paginationResponsePublic(req, res, result)
}

module.exports = {
  fetchPublic
}

