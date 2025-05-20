const { lang } = require('../../lang')
const { pgCore } = require('../../config/database')
const {
  mappingError,
  mappingSuccessPagination,
  manipulateDate
} = require('../../utils')

const TABLE = 'mst_news'
const TABLE_CATEGORY = 'mst_news_category'
const COLUMN_DEFAULT = [
  `${TABLE}.news_id`, `${TABLE}.news_title_id`, `${TABLE}.news_title_en`, `${TABLE}.news_title_cn`,
  `${TABLE}.news_slug_id`, `${TABLE}.news_slug_en`, `${TABLE}.news_slug_cn`,
  `${TABLE}.news_content_id`, `${TABLE}.news_content_en`, `${TABLE}.news_content_cn`,
  `${TABLE}.news_image`, `${TABLE}.news_image_tags`, `${TABLE}.news_status`,
  `${TABLE}.news_published_at`, `${TABLE}.news_category_id`,
  `${TABLE_CATEGORY}.news_category_name_id`, `${TABLE_CATEGORY}.news_category_name_en`, `${TABLE_CATEGORY}.news_category_name_cn`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [`${TABLE}.news_published_at`, 'DESC']

const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where?.news_category_id) {
    builder.where(`${TABLE}.news_category_id`, where.news_category_id)
  }

  if (search) {
    switch (where?.language) {
      case 'id':
        builder.where(function () {
          this.whereILike(`${TABLE}.news_title_id`, `%${search}%`)
            .orWhereILike(`${TABLE}.news_content_id`, `%${search}%`)
            .orWhereILike(`${TABLE_CATEGORY}.news_category_name_id`, `%${search}%`)
        })
        break;
      case 'en':
        builder.where(function () {
          this.whereILike(`${TABLE}.news_title_en`, `%${search}%`)
            .orWhereILike(`${TABLE}.news_content_en`, `%${search}%`)
            .orWhereILike(`${TABLE_CATEGORY}.news_category_name_en`, `%${search}%`)
        })
        break;
      case 'cn':
        builder.where(function () {
          this.whereILike(`${TABLE}.news_title_cn`, `%${search}%`)
            .orWhereILike(`${TABLE}.news_content_cn`, `%${search}%`)
            .orWhereILike(`${TABLE_CATEGORY}.news_category_name_cn`, `%${search}%`)
        })
        break;
      default:
        builder.where(function () {
          this.whereILike(`${TABLE}.news_title_id`, `%${search}%`)
            .orWhereILike(`${TABLE}.news_title_en`, `%${search}%`)
            .orWhereILike(`${TABLE}.news_title_cn`, `%${search}%`)
            .orWhereILike(`${TABLE}.news_content_id`, `%${search}%`)
            .orWhereILike(`${TABLE}.news_content_en`, `%${search}%`)
            .orWhereILike(`${TABLE}.news_content_cn`, `%${search}%`)
            .orWhereILike(`${TABLE_CATEGORY}.news_category_name_id`, `%${search}%`)
            .orWhereILike(`${TABLE_CATEGORY}.news_category_name_en`, `%${search}%`)
            .orWhereILike(`${TABLE_CATEGORY}.news_category_name_cn`, `%${search}%`)
        })
    }
  }

  return builder
}

// Helper function to clean HTML and limit content
const cleanAndLimitContent = (content) => {
  if (!content) return '';
  // Remove HTML tags
  const withoutHtml = content.replace(/<[^>]*>/g, '');
  // Remove extra whitespace and newlines
  const cleaned = withoutHtml.replace(/\s+/g, ' ').trim();
  // Limit to 200 characters
  return cleaned.length > 200 ? `${cleaned.substring(0, 197)}...` : cleaned;
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(TABLE_CATEGORY, `${TABLE}.news_category_id`, `${TABLE_CATEGORY}.news_category_id`)

  if (where != null) {
    query = query.where((builder) => {
      condition(builder, where, search)
    })
  }

  return query
}

const get = async (where, filter, column = COLUMN_DEFAULT) => {
  try {
    const query = sql(where, filter.search)
    const result = await query.clone()
      .select(column)
      .orderBy(filter.direction || DEFAULT_SORT[0], filter.order || DEFAULT_SORT[1])
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    const [rows] = await query.clone().count(column[0])

    // Clean and limit content fields
    const cleanedResult = result.map((item) => ({
      ...item,
      news_content_id: cleanAndLimitContent(item.news_content_id),
      news_content_en: cleanAndLimitContent(item.news_content_en),
      news_content_cn: cleanAndLimitContent(item.news_content_cn)
    }))

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(cleanedResult),
      count: rows?.count
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

const getBySlug = async (slug, language = 'id') => {
  try {
    const query = pgCore(TABLE)
      .leftJoin(TABLE_CATEGORY, `${TABLE}.news_category_id`, `${TABLE_CATEGORY}.news_category_id`)
      .where(`${TABLE}.deleted_at`, null)
      .where(`${TABLE}.news_status`, '1')
      .where(`${TABLE}.news_published_at`, '<=', new Date())

    // Add language-specific slug condition
    switch (language) {
      case 'en':
        query.where(`${TABLE}.news_slug_en`, slug)
        break;
      case 'cn':
        query.where(`${TABLE}.news_slug_cn`, slug)
        break;
      default:
        query.where(`${TABLE}.news_slug_id`, slug)
    }

    const result = await query
      .select(COLUMN_DEFAULT)
      .first()

    if (!result) {
      return mappingError({
        message: lang.__('get.not_found'),
        status: 404
      })
    }

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(result, false),
      count: 1
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  get,
  getBySlug,
  COLUMN_DEFAULT,
  DEFAULT_SORT,
  TABLE
}
