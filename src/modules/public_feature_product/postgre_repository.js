const { pgCore } = require('../../config/database')
const {
  mappingError,
  mappingSuccessPagination,
  manipulateDate
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_feature_product'
const PRODUCT_TABLE = 'mst_product'
const COLUMN_DEFAULT = [
  `${TABLE}.feature_product_id`, `${TABLE}.product_id`, `${TABLE}.feature_product_title_id`, `${TABLE}.feature_product_title_en`, `${TABLE}.feature_product_title_cn`,
  `${PRODUCT_TABLE}.product_name_id`, `${PRODUCT_TABLE}.product_name_en`, `${PRODUCT_TABLE}.product_name_cn`,
  `${TABLE}.no_order`,
  `${TABLE}.feature_product_description_id`, `${TABLE}.feature_product_description_en`, `${TABLE}.feature_product_description_cn`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [`${TABLE}.no_order`, 'ASC']

const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)
  if (where?.product_id) {
    builder.where(`${TABLE}.product_id`, where.product_id)
  }

  if (search) {
    switch (where?.language) {
      case 'id':
        builder.whereILike(`${TABLE}.feature_product_title_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      case 'en':
        builder.whereILike(`${TABLE}.feature_product_title_en`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      case 'cn':
        builder.whereILike(`${TABLE}.feature_product_title_cn`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      default:
        builder.whereILike(`${TABLE}.feature_product_title_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        builder.orWhereILike(`${TABLE}.feature_product_title_en`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        builder.orWhereILike(`${TABLE}.feature_product_title_cn`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    }
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
  query = query.leftJoin(PRODUCT_TABLE, `${PRODUCT_TABLE}.product_id`, `${TABLE}.product_id`)

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
