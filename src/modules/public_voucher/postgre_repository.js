const { pgCore } = require('../../config/database')
const {
  mappingError,
  mappingSuccessPagination,
  manipulateDate
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_voucher'
const COLUMN_DEFAULT = [
  `${TABLE}.voucher_id`,
  `${TABLE}.voucher_code`,
  `${TABLE}.voucher_name`,
  `${TABLE}.voucher_description`,
  `${TABLE}.discount_amount`,
  `${TABLE}.expiry_date`,
  `${TABLE}.created_at`,
  `${TABLE}.created_by`,
  `${TABLE}.updated_at`,
  `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`,
  `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [`${TABLE}.voucher_id`, 'DESC']

const condition = (builder, where) => {
  builder.where(`${TABLE}.deleted_at`, null)
  builder.where(`${TABLE}.expiry_date`, '>=', new Date())

  if (where?.voucher_id) {
    builder.where(`${TABLE}.voucher_id`, where.voucher_id)
  }

  return builder
}

const sql = (where) => {
  let query = pgCore(TABLE)

  if (where != null) {
    query = query.where((builder) => {
      condition(builder, where)
    })
  }

  return query
}

const get = async (where, filter, column = COLUMN_DEFAULT) => {
  try {
    const result = await sql(where).clone()
      .select(column)
      .orderBy(`${filter.direction}`, filter.order)
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    const [rows] = await sql(where).clone().count(column[0])

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(result),
      count: rows?.count
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  get,
  COLUMN_DEFAULT,
  DEFAULT_SORT,
  TABLE
}
