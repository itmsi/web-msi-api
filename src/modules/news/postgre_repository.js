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

const TABLE = 'mst_news'
const CATEGORY_TABLE = 'mst_news_category'
const COLUMN_ALL = [
  `${TABLE}.news_id`, `${TABLE}.news_title_id`, `${TABLE}.news_title_en`, `${TABLE}.news_title_cn`,
  `${TABLE}.news_slug_id`, `${TABLE}.news_slug_en`, `${TABLE}.news_slug_cn`, `${TABLE}.news_content_id`,
  `${TABLE}.news_content_en`, `${TABLE}.news_content_cn`, `${TABLE}.news_meta_description_id`,
  `${TABLE}.news_meta_description_en`, `${TABLE}.news_meta_description_cn`, `${TABLE}.news_meta_keywords_id`,
  `${TABLE}.news_meta_keywords_en`, `${TABLE}.news_meta_keywords_cn`, `${TABLE}.news_meta_title_id`,
  `${TABLE}.news_meta_title_en`, `${TABLE}.news_meta_title_cn`, `${TABLE}.news_category_id`,
  `${TABLE}.news_image`, `${TABLE}.news_image_caption`, `${TABLE}.news_image_alt`,
  `${TABLE}.news_image_title`, `${TABLE}.news_image_description`, `${TABLE}.news_image_keywords`,
  `${TABLE}.news_image_tags`, `${TABLE}.news_status`, `${TABLE}.news_published_at`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`,
  `${TABLE}.updated_by`, `${TABLE}.deleted_at`, `${TABLE}.deleted_by`,
  `${CATEGORY_TABLE}.news_category_name_id`, `${CATEGORY_TABLE}.news_category_name_en`,
  `${CATEGORY_TABLE}.news_category_name_cn`
]

const COLUMN = [
  `${TABLE}.news_id`, `${TABLE}.news_title_id`, `${TABLE}.news_title_en`, `${TABLE}.news_title_cn`,
  `${TABLE}.news_slug_id`, `${TABLE}.news_slug_en`, `${TABLE}.news_slug_cn`, `${TABLE}.news_content_id`,
  `${TABLE}.news_content_en`, `${TABLE}.news_content_cn`, `${TABLE}.news_meta_description_id`,
  `${TABLE}.news_meta_description_en`, `${TABLE}.news_meta_description_cn`, `${TABLE}.news_meta_keywords_id`,
  `${TABLE}.news_meta_keywords_en`, `${TABLE}.news_meta_keywords_cn`, `${TABLE}.news_meta_title_id`,
  `${TABLE}.news_meta_title_en`, `${TABLE}.news_meta_title_cn`, `${TABLE}.news_category_id`,
  `${TABLE}.news_image`, `${TABLE}.news_image_caption`, `${TABLE}.news_image_alt`,
  `${TABLE}.news_image_title`, `${TABLE}.news_image_description`, `${TABLE}.news_image_keywords`,
  `${TABLE}.news_image_tags`, `${TABLE}.news_status`, `${TABLE}.news_published_at`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`,
  `${TABLE}.updated_by`, `${TABLE}.deleted_at`, `${TABLE}.deleted_by`,
  `${CATEGORY_TABLE}.news_category_name_id`, `${CATEGORY_TABLE}.news_category_name_en`,
  `${CATEGORY_TABLE}.news_category_name_cn`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.news_id) {
    builder.where(`${TABLE}.news_id`, where.news_id)
  }

  if (search) {
    builder.where(function () {
      this.whereILike(`${TABLE}.news_title_id`, `%${search}%`)
        .orWhereILike(`${TABLE}.news_title_en`, `%${search}%`)
        .orWhereILike(`${TABLE}.news_title_cn`, `%${search}%`)
        .orWhereILike(`${TABLE}.news_slug_id`, `%${search}%`)
        .orWhereILike(`${TABLE}.news_slug_en`, `%${search}%`)
        .orWhereILike(`${TABLE}.news_slug_cn`, `%${search}%`)
    })
  }

  if (where.news_category_id) {
    builder.where(`${TABLE}.news_category_id`, where.news_category_id)
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(CATEGORY_TABLE, `${TABLE}.news_category_id`, `${CATEGORY_TABLE}.news_category_id`)

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

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(result),
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
      .where(`${TABLE}.${PRIMARY_KEY.NEWS}`, where?.[PRIMARY_KEY.NEWS])
    if (rows) {
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.news_id }), rows)
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
      message = lang.__('updated.success', { id: where?.news_id })
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.news_id })
      const [rows] = await pgCore(TABLE).select(['news_title_id', 'news_title_en', 'news_title_cn', 'news_slug_id', 'news_slug_en', 'news_slug_cn']).where(where)
      if (rows) {
        payload.news_title_id = `archived-${format}-${rows.news_title_id}`
        payload.news_title_en = `archived-${format}-${rows.news_title_en}`
        payload.news_title_cn = `archived-${format}-${rows.news_title_cn}`
        payload.news_slug_id = `archived-${format}-${rows.news_slug_id}`
        payload.news_slug_en = `archived-${format}-${rows.news_slug_en}`
        payload.news_slug_cn = `archived-${format}-${rows.news_slug_cn}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE).where(where).update(payload).returning(['news_id'])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.news_id }), result)
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
