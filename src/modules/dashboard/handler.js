const repository = require('./postgre_repository')
const {
  baseResponse,
  paginationResponse,
  paging,
  decodeToken,
  generateUpload,
  mappingSuccess,
  requestHttp,
  generateUploadUpdated,
  dynamicFilterJoin,
} = require('../../utils')
const { lang } = require('../../lang')

const fetch = async (req, res) => {
  const where = req.query;
  const result = await repository.get(where)
  return baseResponse(res, result)
}

const fetchTable = async (req, res) => {
  const where = req.query;

  if (req.query?.start_date && req.query?.end_date) {
    where.start_date = req.query.start_date
    where.end_date = req.query.end_date
  }
  const filter = paging(req, 'mst_client.client_no')
  const result = await repository.getTable(where, filter)
  return paginationResponse(req, res, result)
}

module.exports = {
  fetch,
  fetchTable
}
