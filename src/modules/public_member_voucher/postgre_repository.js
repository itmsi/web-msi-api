const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const { publishToRabbitMqQueueSingle } = require('../../config/rabbitmq')
const {
  mappingSuccess,
  mappingError,
  manipulateDate,
  mappingSuccessPagination,
  todayFormat,
  MODEL_PROPERTIES: { PRIMARY_KEY }
} = require('../../utils')
const { lang } = require('../../lang')
const { MEMBER_VOUCHER_QUEUE, MEMBER_VOUCHER_EXCHANGE } = require('./consumer')

const TABLE = 'member_vouchers'

const COLUMN_ALL = [
  `${TABLE}.member_voucher_id`, `${TABLE}.member_id`, `${TABLE}.voucher_id`,
  `${TABLE}.expired_date`, `${TABLE}.status_approve`, `${TABLE}.description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const COLUMN = [
  `${TABLE}.member_voucher_id`, `${TABLE}.member_id`, `${TABLE}.voucher_id`,
  `${TABLE}.expired_date`, `${TABLE}.status_approve`, `${TABLE}.description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.member_voucher_id) {
    builder.where(`${TABLE}.member_voucher_id`, where.member_voucher_id)
  }

  if (where.member_id) {
    builder.where(`${TABLE}.member_id`, where.member_id)
  }

  if (where.voucher_id) {
    builder.where(`${TABLE}.voucher_id`, where.voucher_id)
  }

  if (search) {
    builder.whereILike(`${TABLE}.member_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.voucher_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  }

  return builder
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
  try {
    // Publish to RabbitMQ for async processing
    const rabbitMQPayload = {
      data: payload,
      action: {
        type: 'CREATE',
        process: 'MEMBER_VOUCHER'
      }
    }

    await publishToRabbitMqQueueSingle(
      MEMBER_VOUCHER_EXCHANGE,
      MEMBER_VOUCHER_QUEUE,
      rabbitMQPayload
    )

    return mappingSuccess(lang.__('created.success'), { message: 'Request queued for processing' })
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
const getByParam = async (where, column = COLUMN_ALL) => {
  try {
    const [rows] = await sql(null).clone()
      .select(column)
      .where(`${TABLE}.${PRIMARY_KEY.MEMBER_VOUCHER}`, where?.[PRIMARY_KEY.MEMBER_VOUCHER])
    if (rows) {
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.MEMBER_VOUCHER] }), rows)
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
      message = lang.__('updated.success', { id: where?.[PRIMARY_KEY.MEMBER_VOUCHER] })
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.[PRIMARY_KEY.MEMBER_VOUCHER] })
      const [rows] = await pgCore(TABLE).select(['member_voucher_id', 'description']).where(where)
      if (rows) {
        payload.description = `archived-${format}-${rows.description}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE).where(where).update(payload).returning(['member_voucher_id'])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.MEMBER_VOUCHER] }), result)
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
  MEMBER_VOUCHER_QUEUE,
  MEMBER_VOUCHER_EXCHANGE
}
