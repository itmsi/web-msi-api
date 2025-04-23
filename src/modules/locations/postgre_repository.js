const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const {
  mappingSuccess,
  mappingError,
  manipulateDate,
  mappingSuccessPagination,
  todayFormat,
  MODEL_PROPERTIES: { TABLES, PRIMARY_KEY }
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_location'
const TABLE_JOIN_PROVINCE = 'mst_province'
const TABLE_JOIN_CITY = 'mst_city'
const COLUMN_ALL = [
  `${TABLE}.location_id`, `${TABLE}.location_code`, `${TABLE}.location_name`,
  `${TABLE}.location_account_number`, `${TABLE}.location_code_inventory`, `${TABLE}.location_code_accounting`,
  `${TABLE}.location_type`, `${TABLE}.location_detail`, `${TABLE}.location_status`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const COLUMN = [
  `${TABLE}.location_id`, `${TABLE}.location_code`, `${TABLE}.location_name`, `${TABLE}.location_type`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.location_id) {
    builder.where(`${TABLE}.location_id`, where.location_id)
  }

  if (where.location_type) {
    if (where.location_type === 'car') {
      builder.whereILike(`${TABLE}.location_type`, '%car%').orWhereILike(`${TABLE}.location_type`, '%car and bike%')
        .andWhere(`${TABLE}.deleted_at`, null)
    } else {
      builder.whereILike(`${TABLE}.location_type`, '%bike%').orWhereILike(`${TABLE}.location_type`, '%car and bike%')
        .andWhere(`${TABLE}.deleted_at`, null)
    }
  }

  if (search) {
    builder.whereILike(`${TABLE}.location_code`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.location_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.location_type`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  }

  return builder
}

const getCharCodeNumber = (number, max = 3) => {
  if (number.toString().length >= max) {
    return number;
  }
  let str = ''
  for (let i = 0; i < (max - number.toString().length); i += 1) {
    str += '0'
  }
  return `${str}${number}`;
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)

  if (where != null) {
    query = query.where((builder) => {
      condition(builder, where, search)
    })
  }

  return query
}
/**
 *
 *
 * @param {*} payload
 * @return {*}
 */
const create = async (payload) => {
  const transaction = await pgCore.transaction();

  try {
    const result = await Repo.insert(TABLE, payload, COLUMN[0])

    if (!result) {
      transaction.rollback();
      return mappingSuccess(lang.__('created.failed'), null, 200, false)
    }

    transaction.commit();
    return mappingSuccess(lang.__('created.success'), result)
  } catch (error) {
    transaction.rollback();
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
const getByParam = async (where, column = COLUMN_ALL) => {
  try {
    const [rows] = await sql(null).clone()
      .select(column)
      .where(`${TABLES.LOCATION}.${PRIMARY_KEY.LOCATION}`, where?.[PRIMARY_KEY.LOCATION])
    if (rows) {
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.location_id }), rows)
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
    let { message, result } = ['', '']
    where[`${TABLE}.deleted_at`] = null
    if (payload.type_method === 'update') {
      message = lang.__('updated.success', { id: where?.location_id })
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.location_id })
      const [rows] = await pgCore(TABLE).select(['location_code', 'location_name']).where(where)
      if (rows) {
        payload.location_code = `archived-${format}-${rows.location_code}`
        payload.location_name = `archived-${format}-${rows.location_name}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE).where(where).update(payload).returning(['location_id'])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.location_id }), result)
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
  TABLE
}
