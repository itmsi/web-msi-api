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
const { VOUCHER_QUEUE, VOUCHER_EXCHANGE } = require('./consumer')

const TABLE = 'member_vouchers'
const VOUCHER_TABLE = 'mst_voucher'
const MEMBER_TABLE = 'mst_customer'
const COLUMN_ALL = [
  `${TABLE}.member_voucher_id`, `${TABLE}.member_id`, `${TABLE}.voucher_id`,
  `${TABLE}.expired_date`, `${TABLE}.status_approve`, `${TABLE}.description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`,
  `${VOUCHER_TABLE}.voucher_id`, `${VOUCHER_TABLE}.voucher_code`, `${VOUCHER_TABLE}.voucher_name`,
  `${VOUCHER_TABLE}.discount_amount`, `${VOUCHER_TABLE}.expiry_date`,
  `${MEMBER_TABLE}.first_name`, `${MEMBER_TABLE}.last_name`, `${MEMBER_TABLE}.customer_no`
]

const DEFAULT_SORT = [COLUMN_ALL[0], 'DESC']

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
    builder.where(function () {
      this.whereILike(`${TABLE}.member_id`, `%${search}%`)
        .orWhereILike(`${TABLE}.voucher_id`, `%${search}%`)
    })
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
  query = query.leftJoin(VOUCHER_TABLE, `${TABLE}.voucher_id`, `${VOUCHER_TABLE}.voucher_id`)
  query = query.leftJoin(MEMBER_TABLE, `${TABLE}.member_id`, `${MEMBER_TABLE}.customer_id`)

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
    const result = await Repo.insert(TABLE, payload, COLUMN_ALL[0], transaction)

    if (!result) {
      await transaction.rollback();
      return mappingSuccess(lang.__('created.failed'), null, 200, false)
    }

    await transaction.commit();
    return mappingSuccess(lang.__('created.success'), result)
  } catch (error) {
    await transaction.rollback();
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
const get = async (where, filter, column = COLUMN_ALL) => {
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
    const [rows] = await sql(where).clone()
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
  const transaction = await pgCore.transaction();

  try {
    let message = ''
    where[`${TABLE}.deleted_at`] = null

    const typeMethod = payload.type_method
    delete payload.type_method

    if (typeMethod === 'update') {
      message = lang.__('updated.success', { id: where?.member_voucher_id })
      const result = await Repo.updated(TABLE, where, payload, COLUMN_ALL[0], name, transaction)

      if (result) {
        if (payload.status_approve === 1) {
          // First check if the member_voucher exists
          const member_voucher = await pgCore(TABLE)
            .select('*')
            .where('member_voucher_id', where.member_voucher_id)
            .first();

          if (!member_voucher) {
            throw new Error(`Member voucher with ID ${where.member_voucher_id} not found`);
          }

          const voucher = await pgCore(VOUCHER_TABLE)
            .select('*')
            .where('voucher_id', member_voucher.voucher_id)
            .first();

          if (!voucher) {
            throw new Error(`Voucher with ID ${member_voucher.voucher_id} not found`);
          }

          const member = await pgCore(MEMBER_TABLE)
            .select('*')
            .where('customer_id', member_voucher.member_id)
            .first();

          if (!member) {
            throw new Error(`Member with ID ${member_voucher.member_id} not found`);
          }

          const publishPayload = {
            ...member_voucher,
            voucher_name: voucher.voucher_name,
            voucher_code: voucher.voucher_code,
            expiry_date: voucher.expiry_date,
            customer_no: member.customer_no,
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email
          }

          // Publish message to RabbitMQ
          publishToRabbitMqQueueSingle(VOUCHER_EXCHANGE, VOUCHER_QUEUE, {
            type: 'APPROVE_VOUCHER',
            data: publishPayload
          });
        }
        await transaction.commit();
        return mappingSuccess(message, result)
      }
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.[PRIMARY_KEY.MEMBER_VOUCHER] })
      const [rows] = await pgCore(TABLE).select(['member_voucher_id', 'description']).where(where)
      if (rows) {
        payload.description = `archived-${format}-${rows.description}`
      }

      const result = await pgCore(TABLE).where(where).update(payload).returning(['member_voucher_id'])

      if (result) {
        await transaction.commit();
        return mappingSuccess(message, result)
      }
    }

    await transaction.rollback();
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.MEMBER_VOUCHER] }), null)
  } catch (error) {
    await transaction.rollback();
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  create,
  get,
  update,
  getByParam,
  COLUMN: COLUMN_ALL,
  DEFAULT_SORT,
  TABLE
}
