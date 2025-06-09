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

const TABLE = 'mst_specification_values'
const TABLE_SPECIFICATION = 'mst_specifications'
const TABLE_SPECIFICATION_LABEL = 'mst_specification_labels'
const TABLE_PRODUCT = 'mst_product'
const TABLE_PRODUCT_MODEL = 'mst_product_model'
const TABLE_PRODUCT_DIMENSI = 'mst_product_dimensi'

const COLUMN_ALL = [
  `${TABLE}.specification_value_id`, `${TABLE}.specification_value_name`,
  `${TABLE_SPECIFICATION}.specification_id`, `${TABLE_SPECIFICATION}.specification_name`,
  `${TABLE_SPECIFICATION_LABEL}.specification_label_id`, `${TABLE_SPECIFICATION_LABEL}.specification_label_name`,
  `${TABLE_PRODUCT}.product_id`, `${TABLE_PRODUCT}.product_name_en`,
  `${TABLE_PRODUCT_MODEL}.product_model_id`, `${TABLE_PRODUCT_MODEL}.product_model_name`,
  `${TABLE_PRODUCT_DIMENSI}.product_dimensi_id`, `${TABLE_PRODUCT_DIMENSI}.product_dimensi_value`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const COLUMN = [
  `${TABLE}.specification_value_id`, `${TABLE}.specification_value_name`,
  `${TABLE_SPECIFICATION}.specification_id`, `${TABLE_SPECIFICATION}.specification_name`,
  `${TABLE_SPECIFICATION_LABEL}.specification_label_id`, `${TABLE_SPECIFICATION_LABEL}.specification_label_name`,
  `${TABLE_PRODUCT}.product_id`, `${TABLE_PRODUCT}.product_name_en`,
  `${TABLE_PRODUCT_MODEL}.product_model_id`, `${TABLE_PRODUCT_MODEL}.product_model_name`,
  `${TABLE_PRODUCT_DIMENSI}.product_dimensi_id`, `${TABLE_PRODUCT_DIMENSI}.product_dimensi_value`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.specification_value_id) {
    builder.where(`${TABLE}.specification_value_id`, where.specification_value_id)
  }

  if (where.specification_label_id) {
    builder.where(`${TABLE_SPECIFICATION_LABEL}.specification_label_id`, where.specification_label_id)
  }

  if (where.specification_id) {
    builder.where(`${TABLE_SPECIFICATION}.specification_id`, where.specification_id)
  }

  if (search) {
    builder.whereILike(`${TABLE}.specification_value_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(TABLE_SPECIFICATION_LABEL, `${TABLE}.specification_label_id`, `${TABLE_SPECIFICATION_LABEL}.specification_label_id`)
    .leftJoin(TABLE_SPECIFICATION, `${TABLE_SPECIFICATION_LABEL}.specification_id`, `${TABLE_SPECIFICATION}.specification_id`)
    .leftJoin(TABLE_PRODUCT_DIMENSI, `${TABLE}.product_dimensi_id`, `${TABLE_PRODUCT_DIMENSI}.product_dimensi_id`)
    .leftJoin(TABLE_PRODUCT_MODEL, `${TABLE_PRODUCT_DIMENSI}.product_model_id`, `${TABLE_PRODUCT_MODEL}.product_model_id`)
    .leftJoin(TABLE_PRODUCT, `${TABLE_PRODUCT_MODEL}.product_id`, `${TABLE_PRODUCT}.product_id`)

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
      .where(`${TABLE}.${PRIMARY_KEY.SPECIFICATION_VALUE}`, where?.[PRIMARY_KEY.SPECIFICATION_VALUE])
    if (rows) {
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.SPECIFICATION_VALUE] }), rows)
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
const update = async (where, payload) => {
  try {
    let { message, result } = ['', '']
    where[`${TABLE}.deleted_at`] = null

    // Only include fields that exist in the table based on migration
    const updatePayload = {
      specification_value_name: payload.specification_value_name,
      specification_label_id: payload.specification_label_id,
      product_dimensi_id: payload.product_dimensi_id,
      description: payload.description,
      updated_at: payload.updated_at,
      updated_by: payload.updated_by
    }

    if (payload.type_method === 'update') {
      message = lang.__('updated.success', { id: where?.[PRIMARY_KEY.SPECIFICATION_VALUE] })
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.[PRIMARY_KEY.SPECIFICATION_VALUE] })
      const [rows] = await pgCore(TABLE).select(['specification_value_name']).where(where)
      if (rows) {
        updatePayload.specification_value_name = `archived-${format}-${rows.specification_value_name}`
        updatePayload.deleted_at = payload.deleted_at
        updatePayload.deleted_by = payload.deleted_by
      }
    }

    result = await pgCore(TABLE)
      .where(where)
      .update(updatePayload)
      .returning([PRIMARY_KEY.SPECIFICATION_VALUE])

    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.SPECIFICATION_VALUE] }), result)
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
