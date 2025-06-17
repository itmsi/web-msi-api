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

const TABLE = 'mst_flayer_product'
const PRODUCT_TABLE = 'mst_product'
const TYPE_TABLE = 'mst_type_product'

const COLUMN_ALL = [
  `${TABLE}.flayer_product_id`, `${TABLE}.product_id`, `${TABLE}.flayer_product_name_id`, `${TABLE}.flayer_product_name_en`, `${TABLE}.flayer_product_name_cn`,
  `${TABLE}.flayer_product_description`, `${TABLE}.flayer_product_file`,
  `${PRODUCT_TABLE}.product_name_id`, `${PRODUCT_TABLE}.product_name_en`, `${PRODUCT_TABLE}.product_name_cn`,
  `${TYPE_TABLE}.type_product_name_id`, `${TYPE_TABLE}.type_product_name_en`, `${TYPE_TABLE}.type_product_name_cn`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const COLUMN = [
  `${TABLE}.flayer_product_id`, `${TABLE}.product_id`, `${TABLE}.flayer_product_name_id`, `${TABLE}.flayer_product_name_en`, `${TABLE}.flayer_product_name_cn`,
  `${TABLE}.flayer_product_description`, `${TABLE}.flayer_product_file`,
  `${PRODUCT_TABLE}.product_name_id`, `${PRODUCT_TABLE}.product_name_en`, `${PRODUCT_TABLE}.product_name_cn`,
  `${TYPE_TABLE}.type_product_name_id`, `${TYPE_TABLE}.type_product_name_en`, `${TYPE_TABLE}.type_product_name_cn`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.product_id) {
    builder.where(`${TABLE}.flayer_product_id`, where.flayer_product_id)
  }

  if (search) {
    builder.whereILike(`${TABLE}.flayer_product_name_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.flayer_product_name_en`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.flayer_product_name_cn`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.flayer_product_description`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(PRODUCT_TABLE, `${TABLE}.product_id`, `${PRODUCT_TABLE}.product_id`)
    .leftJoin(TYPE_TABLE, `${PRODUCT_TABLE}.type_product_id`, `${TYPE_TABLE}.type_product_id`)
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
      .where(`${TABLE}.${PRIMARY_KEY.FLYER_PRODUCT}`, where?.[PRIMARY_KEY.FLYER_PRODUCT])
    if (rows) {
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.FLYER_PRODUCT] }), rows)
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
      message = lang.__('updated.success', { id: where?.[PRIMARY_KEY.FLYER_PRODUCT] })
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.[PRIMARY_KEY.FLYER_PRODUCT] })
      const [rows] = await pgCore(TABLE).select(['flayer_product_name_id', 'flayer_product_name_en', 'flayer_product_name_cn', 'flayer_product_description']).where(where)
      if (rows) {
        payload.flayer_product_name_id = `archived-${format}-${rows.flayer_product_name_id}`
        payload.flayer_product_name_en = `archived-${format}-${rows.flayer_product_name_en}`
        payload.flayer_product_name_cn = `archived-${format}-${rows.flayer_product_name_cn}`
        payload.flayer_product_description = `archived-${format}-${rows.flayer_product_description}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE).where(where).update(payload).returning([PRIMARY_KEY.FLYER_PRODUCT])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.FLYER_PRODUCT] }), result)
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
