const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const {
  mappingSuccess, mappingError, manipulateDate, mappingSuccessPagination
} = require('../../utils')
const { lang } = require('../../lang')

const COLUMN = ['id', 'description', 'bank_code_midtrans', 'admin_fee', 'status', 'bank_image',
  'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by'
]
const TABLE = 'mst_bank'
const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search) => {
  if (search) {
    builder.where(where).whereILike('description', `%${search}%`).andWhere('deleted_at', null)
    builder.orWhere(where).orWhereILike('bank_code_midtrans', `%${search}%`).andWhere('deleted_at', null)
    builder.orWhere(where).orWhereILike('status', `%${search}%`).andWhere('deleted_at', null)
  } else {
    builder.where(where)
    builder.andWhere('deleted_at', null)
  }
  return builder
}

const sql = (where, filter = false) => {
  const query = pgCore(TABLE)
    .where((builder) => {
      condition(builder, where, filter.search)
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
    const result = await sql(where, filter).clone()
      .select(column)
      .orderBy(filter.direction, filter.order)
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    const [rows] = await sql(where, filter).clone().count(column[0])

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
 * @param {*} filter
 * @return {*}
 */
const getPublic = async (where, filter, column = COLUMN) => {
  try {
    const result = await sql(where, filter).clone().select(column)
    return mappingSuccess(lang.__('get.success'), result)
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
    where.deleted_at = null
    const result = await Repo.fetchByParam(TABLE, where, column)
    if (result) {
      return mappingSuccess(lang.__('get.success'), result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.id }), result)
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
    if (payload.type_method === 'update') {
      message = lang.__('updated.success', { id: where?.id })
    } else {
      message = lang.__('archive.success', { id: where?.id })
    }
    const result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.id }), result)
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
  getPublic,
  COLUMN,
  DEFAULT_SORT
}
