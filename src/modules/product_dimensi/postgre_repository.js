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

const TABLE = 'mst_product_dimensi'
const TABLE_MODEL = 'mst_product_model'
const PRODUCT_TABLE = 'mst_product'

const COLUMN_ALL = [
  `${TABLE}.product_dimensi_id`, `${TABLE}.product_model_id`, `${TABLE}.product_dimensi_value`, `${TABLE}.product_dimensi_description`,
  `${TABLE_MODEL}.product_model_name`,
  `${PRODUCT_TABLE}.product_name_id`, `${PRODUCT_TABLE}.product_name_en`, `${PRODUCT_TABLE}.product_name_cn`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const COLUMN = [
  `${TABLE}.product_dimensi_id`, `${TABLE}.product_model_id`, `${TABLE}.product_dimensi_value`, `${TABLE}.product_dimensi_description`,
  `${TABLE_MODEL}.product_model_name`,
  `${PRODUCT_TABLE}.product_name_id`, `${PRODUCT_TABLE}.product_name_en`, `${PRODUCT_TABLE}.product_name_cn`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.product_model_id) {
    builder.where(`${TABLE}.product_model_id`, where.product_model_id)
  }

  if (search) {
    builder.orWhereILike(`${TABLE}.product_dimensi_value`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.product_dimensi_description`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(TABLE_MODEL, `${TABLE}.product_model_id`, `${TABLE_MODEL}.product_model_id`)
    .leftJoin(PRODUCT_TABLE, `${TABLE_MODEL}.product_id`, `${PRODUCT_TABLE}.product_id`)

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
      .where(`${TABLE}.${PRIMARY_KEY.PRODUCT_DIMENSI}`, where?.[PRIMARY_KEY.PRODUCT_DIMENSI])
    if (rows) {
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.PRODUCT_DIMENSI] }), rows)
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
      message = lang.__('updated.success', { id: where?.[PRIMARY_KEY.PRODUCT_DIMENSI] })
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.[PRIMARY_KEY.PRODUCT_DIMENSI] })
      const [rows] = await pgCore(TABLE).select(['product_dimensi_value', 'product_dimensi_description']).where(where)
      if (rows) {
        payload.product_dimensi_description = `archived-${format}-${rows.product_dimensi_description}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE)
      .where(where)
      .update(payload)
      .returning([PRIMARY_KEY.PRODUCT_DIMENSI])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.PRODUCT_DIMENSI] }), result)
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
