const { pgCore } = require('../../config/database')
const {
  mappingError,
  mappingSuccessPagination,
  manipulateDate
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_solution_category'
const COLUMN_DEFAULT = [
  `${TABLE}.solution_category_name_id`, `${TABLE}.solution_category_name_en`, `${TABLE}.solution_category_name_cn`
]

const DEFAULT_SORT = [`${TABLE}.solution_category_id`, 'DESC']

const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)
  if (where?.solution_category_id) {
    builder.where(`${TABLE}.solution_category_id`, where.solution_category_id)
  }

  if (search) {
    switch (where?.language) {
      case 'id':
        builder.whereILike(`${TABLE}.solution_category_name_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      case 'en':
        builder.whereILike(`${TABLE}.solution_category_name_en`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      case 'cn':
        builder.whereILike(`${TABLE}.solution_category_name_cn`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      default:
        builder.whereILike(`${TABLE}.solution_category_name_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        builder.orWhereILike(`${TABLE}.solution_category_name_en`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        builder.orWhereILike(`${TABLE}.solution_category_name_cn`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    }
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)

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
