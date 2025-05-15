const { pgCore } = require('../../config/database')
const {
  mappingError,
  mappingSuccessPagination,
  manipulateDate
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_product'
const TYPE_TABLE = 'mst_type_product'
const COLUMN_DEFAULT = [
  `${TABLE}.product_id`, `${TABLE}.type_product_id`, `${TABLE}.product_name_id`, `${TABLE}.product_name_en`, `${TABLE}.product_name_cn`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`,
  `${TYPE_TABLE}.type_product_name_id`, `${TYPE_TABLE}.type_product_name_en`, `${TYPE_TABLE}.type_product_name_cn`
]

const DEFAULT_SORT = [`${TABLE}.product_id`, 'DESC']

const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)
  if (where?.product_id) {
    builder.where(`${TABLE}.product_id`, where.product_id)
  }

  if (search) {
    switch (where?.language) {
      case 'id':
        builder.whereILike(`${TABLE}.product_name_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      case 'en':
        builder.whereILike(`${TABLE}.product_name_en`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      case 'cn':
        builder.whereILike(`${TABLE}.product_name_cn`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      default:
        builder.whereILike(`${TABLE}.product_name_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        builder.orWhereILike(`${TABLE}.product_name_en`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        builder.orWhereILike(`${TABLE}.product_name_cn`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    }
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(TYPE_TABLE, `${TABLE}.type_product_id`, `${TYPE_TABLE}.type_product_id`)

  if (where != null) {
    query = query.where((builder) => {
      condition(builder, where, search)
    })
  }

  return query
}

const get = async (where, filter, column = COLUMN_DEFAULT) => {
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

module.exports = {
  get,
  COLUMN_DEFAULT,
  DEFAULT_SORT,
  TABLE
}
