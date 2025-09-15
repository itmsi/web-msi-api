const moment = require('moment')
const { lang } = require('../../lang')
const { pgCore } = require('../../config/database')
const {
  mappingError,
  mappingSuccessPagination,
  manipulateDate
} = require('../../utils')

const TABLE = 'mst_solution_content'
const TABLE_CATEGORY = 'mst_solution_category'
const COLUMN_DEFAULT = [
  `${TABLE}.solution_content_id`, `${TABLE}.solution_title_id`, `${TABLE}.solution_title_en`, `${TABLE}.solution_title_cn`,
  `${TABLE}.solution_slug_id`, `${TABLE}.solution_slug_en`, `${TABLE}.solution_slug_cn`,
  `${TABLE}.solution_content_body_id`, `${TABLE}.solution_content_body_en`, `${TABLE}.solution_content_body_cn`,
  `${TABLE}.solution_image`, `${TABLE}.solution_image_tags`,
  `${TABLE_CATEGORY}.solution_category_name_id`, `${TABLE_CATEGORY}.solution_category_name_en`, `${TABLE_CATEGORY}.solution_category_name_cn`,
  `${TABLE}.created_at`, `${TABLE}.solution_published_at`,
  `${TABLE}.solution_meta_title_id`, `${TABLE}.solution_meta_title_en`, `${TABLE}.solution_meta_title_cn`,
  `${TABLE}.solution_meta_description_id`, `${TABLE}.solution_meta_description_en`, `${TABLE}.solution_meta_description_cn`,
  `${TABLE}.solution_meta_keywords_id`, `${TABLE}.solution_meta_keywords_en`, `${TABLE}.solution_meta_keywords_cn`
]

const DEFAULT_SORT = [`${TABLE}.solution_published_at`, 'DESC']

const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)
  builder.where(`${TABLE}.solution_status`, 'published')

  if (where?.solution_category_id) {
    builder.where(`${TABLE}.solution_category_id`, where.solution_category_id)
  }

  if (search) {
    switch (where?.language) {
      case 'id':
        builder.where(function () {
          this.whereILike(`${TABLE}.solution_title_id`, `%${search}%`)
            .orWhereILike(`${TABLE}.solution_content_body_id`, `%${search}%`)
            .orWhereILike(`${TABLE_CATEGORY}.solution_category_name_id`, `%${search}%`)
        })
        break;
      case 'en':
        builder.where(function () {
          this.whereILike(`${TABLE}.solution_title_en`, `%${search}%`)
            .orWhereILike(`${TABLE}.solution_content_body_en`, `%${search}%`)
            .orWhereILike(`${TABLE_CATEGORY}.solution_category_name_en`, `%${search}%`)
        })
        break;
      case 'cn':
        builder.where(function () {
          this.whereILike(`${TABLE}.solution_title_cn`, `%${search}%`)
            .orWhereILike(`${TABLE}.solution_content_body_cn`, `%${search}%`)
            .orWhereILike(`${TABLE_CATEGORY}.solution_category_name_cn`, `%${search}%`)
        })
        break;
      default:
        builder.where(function () {
          this.whereILike(`${TABLE}.solution_title_id`, `%${search}%`)
            .orWhereILike(`${TABLE}.solution_title_en`, `%${search}%`)
            .orWhereILike(`${TABLE}.solution_title_cn`, `%${search}%`)
            .orWhereILike(`${TABLE}.solution_content_body_id`, `%${search}%`)
            .orWhereILike(`${TABLE}.solution_content_body_en`, `%${search}%`)
            .orWhereILike(`${TABLE}.solution_content_body_cn`, `%${search}%`)
            .orWhereILike(`${TABLE_CATEGORY}.solution_category_name_id`, `%${search}%`)
            .orWhereILike(`${TABLE_CATEGORY}.solution_category_name_en`, `%${search}%`)
            .orWhereILike(`${TABLE_CATEGORY}.solution_category_name_cn`, `%${search}%`)
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
    .leftJoin(TABLE_CATEGORY, `${TABLE}.solution_category_id`, `${TABLE_CATEGORY}.solution_category_id`)

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
    const cleanedResult = result.map((item) => {
      const formattedDate = item.solution_published_at ? moment(item.solution_published_at).format('DD MMM YYYY') : null;
      return {
        ...item,
        solution_content_body_id: cleanAndLimitContent(item.solution_content_body_id),
        solution_content_body_en: cleanAndLimitContent(item.solution_content_body_en),
        solution_content_body_cn: cleanAndLimitContent(item.solution_content_body_cn),
        created_at: formattedDate
      };
    });

    // Skip manipulateDate for created_at since we've already formatted it
    const finalResult = cleanedResult.map((item) => {
      const { created_at, ...rest } = item;
      const manipulated = manipulateDate({ ...rest }, false);
      return { ...manipulated, created_at };
    });

    return mappingSuccessPagination(lang.__('get.success'), {
      result: finalResult,
      count: rows?.count
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

const getBySlug = async (slug, language = 'en') => {
  try {
    const query = pgCore(TABLE)
      .leftJoin(TABLE_CATEGORY, `${TABLE}.solution_category_id`, `${TABLE_CATEGORY}.solution_category_id`)
      .where(`${TABLE}.deleted_at`, null)
      .where(`${TABLE}.solution_status`, 'published')
      .where(`${TABLE}.solution_published_at`, '<=', new Date())

    // Add language-specific slug condition
    switch (language) {
      case 'en':
        query.where(`${TABLE}.solution_slug_en`, slug)
        break;
      case 'cn':
        query.where(`${TABLE}.solution_slug_cn`, slug)
        break;
      default:
        query.where(`${TABLE}.solution_slug_id`, slug)
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

    // Format the date before manipulateDate
    const formattedDate = result.solution_published_at ? moment(result.solution_published_at).format('DD MMM YYYY') : null;
    const { solution_published_at, ...rest } = result;
    const manipulated = manipulateDate({ ...rest }, false);
    const finalResult = { ...manipulated, created_at: formattedDate };

    return mappingSuccessPagination(lang.__('get.success'), {
      result: finalResult,
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
