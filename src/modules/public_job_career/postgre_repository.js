const { pgCore } = require('../../config/database')
const {
  mappingError,
  manipulateDate,
  mappingSuccessPagination,
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_job_career'
const DEPARTMENT_TABLE = 'mst_departement'
const LOCATION_TABLE = 'mst_location'

const COLUMN = [
  `${TABLE}.job_career_id`, `${TABLE}.job_career_name`, `${TABLE}.job_career_description`,
  `${TABLE}.departement_id`, `${TABLE}.location_id`, `${TABLE}.job_career_content`,
  `${TABLE}.created_at`,
  `${DEPARTMENT_TABLE}.departement_name`, `${LOCATION_TABLE}.location_name`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.departement_id) {
    builder.where(`${TABLE}.departement_id`, where.departement_id)
  }
  if (where.location_id) {
    builder.where(`${TABLE}.location_id`, where.location_id)
  }

  if (search) {
    builder.whereILike(`${TABLE}.job_career_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.job_career_description`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(DEPARTMENT_TABLE, `${DEPARTMENT_TABLE}.departement_id`, `${TABLE}.departement_id`)
    .leftJoin(LOCATION_TABLE, `${LOCATION_TABLE}.location_id`, `${TABLE}.location_id`)

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

    // Transform result to add slug_career
    const transformedResult = manipulateDate(result).map((item) => ({
      ...item,
      slug_career: [
        item.job_career_name,
        item.departement_name,
        item.location_name
      ]
        .filter(Boolean) // Remove null/undefined values
        .join(' ')
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
    }))

    return mappingSuccessPagination(lang.__('get.success'), {
      result: transformedResult,
      count: rows?.count
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  get,
  COLUMN,
  DEFAULT_SORT,
  TABLE
}
