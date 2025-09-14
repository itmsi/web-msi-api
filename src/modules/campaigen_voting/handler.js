/**
 * Campaigen Voting Handler
 *
 * Proses public: input email + pilih campaign_participant_id, cek email di mst_email_employee, simpan ke mst_campaigen_voting
 */

const repository = require('./postgre_repository')
const campaignRepository = require('../campaign_doctor_truck/postgre_repository')
const {
  baseResponse, paginationResponse, requestHttp, paging, decodeToken
} = require('../../utils')

const store = async (req, res) => {
  const payload = { ...req?.body, ...decodeToken('created', req) }
  const result = await repository.create(payload)
  return baseResponse(res, result)
}

const storePublic = async (req, res) => {
  try {
    const { campaigen_voting_email, campaign_participant_id } = req?.body || {}

    // Validasi participant exist
    const participant = await campaignRepository.getByParam({ campaign_participant_id })
    if (!participant?.data?.data) {
      return baseResponse(res, { code: 200, data: { status: false, message: 'Data participant tidak ditemukan', data: [] } })
    }

    // Cek email terdaftar di mst_email_employee
    const emailExists = await repository.findEmailEmployeeByEmail(campaigen_voting_email)
    if (!emailExists) {
      return baseResponse(res, { code: 200, data: { status: false, message: 'Email karyawan tidak terdaftar', data: [] } })
    }

    const payload = { ...req?.body, email_employee_id: emailExists.email_employee_id }
    const result = await repository.create(payload)
    return baseResponse(res, result)
  } catch (error) {
    return baseResponse(res, { code: 200, data: { status: false, message: error?.message || 'Terjadi kesalahan', data: [] } })
  }
}

const fetch = async (req, res) => {
  const where = req.query
  const filter = paging(req, repository.DEFAULT_SORT)
  const result = await repository.get(where, filter)
  return paginationResponse(req, res, result)
}

const getVotingStats = async (req, res) => {
  try {
    const stats = await repository.getVotingStats()
    return baseResponse(res, stats)
  } catch (error) {
    return baseResponse(res, { code: 200, data: { status: false, message: error?.message || 'Terjadi kesalahan', data: [] } })
  }
}

const fetchByParam = async (req, res) => {
  const where = requestHttp(req)
  const result = await repository.getByParam(where)
  return baseResponse(res, result)
}

const update = async (req, res) => {
  const where = requestHttp(req)
  const payload = { ...req?.body, type_method: 'update', ...decodeToken('updated', req) }
  const result = await repository.update(where, payload)
  return baseResponse(res, result)
}

const softDelete = async (req, res) => {
  const where = requestHttp(req)
  const payload = { type_method: 'soft-delete', ...decodeToken('deleted', req) }
  const result = await repository.update(where, payload, 'campaigen_voting_description')
  return baseResponse(res, result)
}

module.exports = {
  store,
  storePublic,
  fetch,
  fetchByParam,
  update,
  softDelete,
  getVotingStats
}

