const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const {
  mappingSuccess, mappingError, manipulateDate, mappingSuccessPagination, ROLE
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_users'
const TABLE_JOIN_LOCATION = 'mst_location'
const TABLE_JOIN_ROLE = 'mst_role'
const COLUMN = [
  `${TABLE}.users_id`, `${TABLE}.location_id`, `${TABLE_JOIN_LOCATION}.location_name`,
  `${TABLE_JOIN_ROLE}.role_id`, `${TABLE_JOIN_ROLE}.role_name`, `${TABLE}.username`, `${TABLE}.status`,
  `${TABLE}.email`, `${TABLE}.full_name`, `${TABLE}.jabatan`, `${TABLE}.phone_number`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  if (search) {
    builder.where(where).whereILike(`${TABLE}.username`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.where(where).orWhereILike(`${TABLE}.email`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.where(where).orWhereILike(`${TABLE}.full_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.where(where).orWhereILike(`${TABLE_JOIN_ROLE}.role_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.where(where).orWhereILike(`${TABLE}.status`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  } else {
    builder.where(where)
    builder.whereNotIn(`${TABLE_JOIN_ROLE}.role_name`, [ROLE.ADMIN])
    builder.andWhere(`${TABLE}.deleted_at`, null)
  }
  return builder
}

const sql = (where, search = false) => {
  const query = pgCore(TABLE)
    .innerJoin(TABLE_JOIN_LOCATION, `${TABLE_JOIN_LOCATION}.location_id`, `${TABLE}.location_id`)
    .innerJoin(TABLE_JOIN_ROLE, `${TABLE_JOIN_ROLE}.role_id`, `${TABLE}.role_id`)
    .where((builder) => {
      condition(builder, where, search)
    })

  return query
}
/**
 *
 *
 * @param {*} payload
 * @return {*}
 */
const create = async (payload) => {
  try {
    const result = await Repo.insert(TABLE, payload, COLUMN[0])
    return mappingSuccess(lang.__('created.success'), result)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}
/**
 *
 *
 * @param {*} where
 * @param {*} filter
 * @return {*}
 */
const get = async (where, filter, column = COLUMN) => {
  try {
    const result = await sql(where, filter.search).clone()
      .select(column)
      .orderBy(`${filter.direction}`, filter.order)
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    const [rows] = await sql(where, filter.search).clone().count(column[0])

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(result),
      count: rows?.count
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}
/**
 *
 *
 * @param {*} where
 * @param {*} column
 * @return {*}
 */
const getByParam = async (where, column = COLUMN) => {
  try {
    const [rows] = await sql(where).clone().select(column)
    if (rows) {
      return mappingSuccess(lang.__('get.success'), manipulateDate(rows, false))
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.users_id }), rows)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}
/**
 *
 *
 * @param {*} where
 * @param {*} payload
 * @return {*}
 */
const update = async (where, payload, name = '') => {
  try {
    let message = ''
    where[`${TABLE}.deleted_at`] = null
    if (payload.type_method === 'update') {
      message = lang.__('updated.success', { id: where?.users_id })
    } else {
      message = lang.__('archive.success', { id: where?.users_id })
    }
    const result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.users_id }), result)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

/**
 *
 *
 * @param {*} where
 * @param {*} filter
 * @return {*}
 */
const getAuctionOfficer = async (where, filter, column = COLUMN) => {
  try {
    const rows = await sql(where, filter?.search).clone().select(column).orderBy(`${TABLE}.full_name`, 'ASC')
    if (rows) {
      return mappingSuccess(lang.__('get.success'), manipulateDate(rows, false))
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.users_id }), rows)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  create,
  get,
  update,
  getByParam,
  COLUMN,
  DEFAULT_SORT,
  TABLE,
  getAuctionOfficer
}
