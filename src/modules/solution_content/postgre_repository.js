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
const { formatDateToYYYYMMDD } = require('../../utils/date')
const { lang } = require('../../lang')

const TABLE = 'mst_solution_content'
const CATEGORY_TABLE = 'mst_solution_category'
const COLUMN_ALL = [
  `${TABLE}.solution_content_id`, `${TABLE}.solution_title_id`, `${TABLE}.solution_title_en`, `${TABLE}.solution_title_cn`,
  `${TABLE}.solution_slug_id`, `${TABLE}.solution_slug_en`, `${TABLE}.solution_slug_cn`, `${TABLE}.solution_content_body_id`,
  `${TABLE}.solution_content_body_en`, `${TABLE}.solution_content_body_cn`, `${TABLE}.solution_meta_description_id`,
  `${TABLE}.solution_meta_description_en`, `${TABLE}.solution_meta_description_cn`, `${TABLE}.solution_meta_keywords_id`,
  `${TABLE}.solution_meta_keywords_en`, `${TABLE}.solution_meta_keywords_cn`, `${TABLE}.solution_meta_title_id`,
  `${TABLE}.solution_meta_title_en`, `${TABLE}.solution_meta_title_cn`, `${TABLE}.solution_category_id`,
  `${TABLE}.solution_image`, `${TABLE}.solution_image_caption`, `${TABLE}.solution_image_alt`,
  `${TABLE}.solution_image_title`, `${TABLE}.solution_image_description`, `${TABLE}.solution_image_keywords`,
  `${TABLE}.solution_image_tags`, `${TABLE}.solution_status`, `${TABLE}.solution_published_at`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`,
  `${TABLE}.updated_by`, `${TABLE}.deleted_at`, `${TABLE}.deleted_by`,
  `${CATEGORY_TABLE}.solution_category_name_id`, `${CATEGORY_TABLE}.solution_category_name_en`,
  `${CATEGORY_TABLE}.solution_category_name_cn`
]

const COLUMN = [
  `${TABLE}.solution_content_id`, `${TABLE}.solution_title_id`, `${TABLE}.solution_title_en`, `${TABLE}.solution_title_cn`,
  `${TABLE}.solution_slug_id`, `${TABLE}.solution_slug_en`, `${TABLE}.solution_slug_cn`, `${TABLE}.solution_content_body_id`,
  `${TABLE}.solution_content_body_en`, `${TABLE}.solution_content_body_cn`, `${TABLE}.solution_meta_description_id`,
  `${TABLE}.solution_meta_description_en`, `${TABLE}.solution_meta_description_cn`, `${TABLE}.solution_meta_keywords_id`,
  `${TABLE}.solution_meta_keywords_en`, `${TABLE}.solution_meta_keywords_cn`, `${TABLE}.solution_meta_title_id`,
  `${TABLE}.solution_meta_title_en`, `${TABLE}.solution_meta_title_cn`, `${TABLE}.solution_category_id`,
  `${TABLE}.solution_image`, `${TABLE}.solution_image_caption`, `${TABLE}.solution_image_alt`,
  `${TABLE}.solution_image_title`, `${TABLE}.solution_image_description`, `${TABLE}.solution_image_keywords`,
  `${TABLE}.solution_image_tags`, `${TABLE}.solution_status`, `${TABLE}.solution_published_at`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`,
  `${TABLE}.updated_by`, `${TABLE}.deleted_at`, `${TABLE}.deleted_by`,
  `${CATEGORY_TABLE}.solution_category_name_id`, `${CATEGORY_TABLE}.solution_category_name_en`,
  `${CATEGORY_TABLE}.solution_category_name_cn`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.solution_content_id) {
    builder.where(`${TABLE}.solution_content_id`, where.solution_content_id)
  }

  if (search) {
    builder.where(function () {
      this.whereILike(`${TABLE}.solution_title_id`, `%${search}%`)
        .orWhereILike(`${TABLE}.solution_title_en`, `%${search}%`)
        .orWhereILike(`${TABLE}.solution_title_cn`, `%${search}%`)
        .orWhereILike(`${TABLE}.solution_slug_id`, `%${search}%`)
        .orWhereILike(`${TABLE}.solution_slug_en`, `%${search}%`)
        .orWhereILike(`${TABLE}.solution_slug_cn`, `%${search}%`)
    })
  }

  if (where.solution_category_id) {
    builder.where(`${TABLE}.solution_category_id`, where.solution_category_id)
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(CATEGORY_TABLE, `${TABLE}.solution_category_id`, `${CATEGORY_TABLE}.solution_category_id`)

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
    const query = sql(where, filter.search)
      .select(column)
      .orderBy(filter.direction || DEFAULT_SORT[0], filter.order || DEFAULT_SORT[1])
      .limit(filter.limit || 10)
      .offset(((filter.page || 1) - 1) * (filter.limit || 10))

    // Log the query for debugging
    console.log('Query:', query.toString())

    const result = await query
    console.log('Result:', result)

    const [rows] = await sql(where, filter.search).count(column[0])
    console.log('Count:', rows)

    if (!result || result.length === 0) {
      return mappingSuccessPagination(lang.__('get.success'), {
        result: [],
        count: 0
      })
    }

    // Convert solution_published_at to YYYY-mm-dd format
    const formattedResult = result.map((item) => {
      if (item.solution_published_at) {
        item.solution_published_at = formatDateToYYYYMMDD(item.solution_published_at)
      }
      return item
    })

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(formattedResult),
      count: rows?.count || 0
    })
  } catch (error) {
    console.error('Error in get:', error)
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
      .where(`${TABLE}.${PRIMARY_KEY.SOLUTION_CONTENT}`, where?.[PRIMARY_KEY.SOLUTION_CONTENT])

    if (rows) {
      // Convert solution_published_at to YYYY-mm-dd format
      if (rows.solution_published_at) {
        rows.solution_published_at = formatDateToYYYYMMDD(rows.solution_published_at)
      }
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.solution_content_id }), rows)
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
      message = lang.__('updated.success', { id: where?.solution_content_id })
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.solution_content_id })
      const [rows] = await pgCore(TABLE).select(['solution_title_id', 'solution_title_en', 'solution_title_cn', 'solution_slug_id', 'solution_slug_en', 'solution_slug_cn']).where(where)
      if (rows) {
        payload.solution_title_id = `archived-${format}-${rows.solution_title_id}`
        payload.solution_title_en = `archived-${format}-${rows.solution_title_en}`
        payload.solution_title_cn = `archived-${format}-${rows.solution_title_cn}`
        payload.solution_slug_id = `archived-${format}-${rows.solution_slug_id}`
        payload.solution_slug_en = `archived-${format}-${rows.solution_slug_en}`
        payload.solution_slug_cn = `archived-${format}-${rows.solution_slug_cn}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE).where(where).update(payload).returning(['solution_content_id'])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.solution_content_id }), result)
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
  formatDateToYYYYMMDD
}
