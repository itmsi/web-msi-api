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

const TABLE = 'mst_specification_labels'
const TABLE_SPECIFICATION = 'mst_specifications'

const COLUMN_ALL = [
  `${TABLE}.specification_label_id`, `${TABLE}.specification_label_name`,
  `${TABLE_SPECIFICATION}.specification_id`, `${TABLE_SPECIFICATION}.specification_name`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const COLUMN = [
  `${TABLE}.specification_label_id`, `${TABLE}.specification_label_name`,
  `${TABLE_SPECIFICATION}.specification_id`, `${TABLE_SPECIFICATION}.specification_name`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.specification_label_id) {
    builder.where(`${TABLE}.specification_label_id`, where.specification_label_id)
  }

  if (where.specification_id) {
    builder.where(`${TABLE}.specification_id`, where.specification_id)
  }

  if (search) {
    builder.whereILike(`${TABLE}.specification_label_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(TABLE_SPECIFICATION, `${TABLE}.specification_id`, `${TABLE_SPECIFICATION}.specification_id`)

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
      .where(`${TABLE}.${PRIMARY_KEY.SPECIFICATION_LABEL}`, where?.[PRIMARY_KEY.SPECIFICATION_LABEL])
    if (rows) {
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.SPECIFICATION_LABEL] }), rows)
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
      message = lang.__('updated.success', { id: where?.[PRIMARY_KEY.SPECIFICATION_LABEL] })
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.[PRIMARY_KEY.SPECIFICATION_LABEL] })
      const [rows] = await pgCore(TABLE).select(['specification_label_name']).where(where)
      if (rows) {
        payload.specification_label_name = `archived-${format}-${rows.specification_label_name}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE)
      .where(where)
      .update(payload)
      .returning([PRIMARY_KEY.SPECIFICATION_LABEL])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.SPECIFICATION_LABEL] }), result)
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
