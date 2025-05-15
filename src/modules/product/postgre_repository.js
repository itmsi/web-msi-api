const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const {
  mappingSuccess,
  mappingError,
  manipulateDate,
  mappingSuccessPagination,
  todayFormat,
  MODEL_PROPERTIES: { PRIMARY_KEY }
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_product'
const TYPE_TABLE = 'mst_type_product'

const COLUMN_ALL = [
  `${TABLE}.product_id`, `${TABLE}.type_product_id`, `${TABLE}.product_name_id`, `${TABLE}.product_name_en`, `${TABLE}.product_name_cn`,
  `${TABLE}.banner_product`, `${TABLE}.tagline_banner_product_id`, `${TABLE}.tagline_banner_product_en`, `${TABLE}.tagline_banner_product_cn`,
  `${TABLE}.image_product`, `${TABLE}.product_description_id`, `${TABLE}.product_description_en`, `${TABLE}.product_description_cn`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`,
  `${TYPE_TABLE}.type_product_name_id`, `${TYPE_TABLE}.type_product_name_en`, `${TYPE_TABLE}.type_product_name_cn`
]

const COLUMN = [
  `${TABLE}.product_id`, `${TABLE}.type_product_id`, `${TABLE}.product_name_id`, `${TABLE}.product_name_en`, `${TABLE}.product_name_cn`,
  `${TABLE}.banner_product`, `${TABLE}.tagline_banner_product_id`, `${TABLE}.tagline_banner_product_en`, `${TABLE}.tagline_banner_product_cn`,
  `${TABLE}.image_product`, `${TABLE}.product_description_id`, `${TABLE}.product_description_en`, `${TABLE}.product_description_cn`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`,
  `${TYPE_TABLE}.type_product_name_id`, `${TYPE_TABLE}.type_product_name_en`, `${TYPE_TABLE}.type_product_name_cn`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.product_id) {
    builder.where(`${TABLE}.product_id`, where.product_id)
  }

  if (search) {
    builder.whereILike(`${TABLE}.product_name_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.product_name_en`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.product_name_cn`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.tagline_banner_product_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.tagline_banner_product_en`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.tagline_banner_product_cn`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
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
      .where(`${TABLE}.${PRIMARY_KEY.PRODUCT}`, where?.[PRIMARY_KEY.PRODUCT])
    if (rows) {
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.PRODUCT] }), rows)
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
      message = lang.__('updated.success', { id: where?.[PRIMARY_KEY.PRODUCT] })
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.[PRIMARY_KEY.PRODUCT] })
      const [rows] = await pgCore(TABLE).select(['product_name_id', 'product_name_en', 'product_name_cn', 'product_description_id', 'product_description_en', 'product_description_cn']).where(where)
      if (rows) {
        payload.product_name_id = `archived-${format}-${rows.product_name_id}`
        payload.product_name_en = `archived-${format}-${rows.product_name_en}`
        payload.product_name_cn = `archived-${format}-${rows.product_name_cn}`
        payload.product_description_id = `archived-${format}-${rows.product_description_id}`
        payload.product_description_en = `archived-${format}-${rows.product_description_en}`
        payload.product_description_cn = `archived-${format}-${rows.product_description_cn}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE).where(where).update(payload).returning([PRIMARY_KEY.PRODUCT])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.PRODUCT] }), result)
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
