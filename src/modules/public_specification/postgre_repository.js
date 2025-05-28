const { pgCore } = require('../../config/database')
const {
  mappingError,
  mappingSuccessPagination,
  manipulateDate
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_specifications'
const TABLE_SPECIFICATION_LABEL = 'mst_specification_labels'
const TABLE_SPECIFICATION_VALUE = 'mst_specification_values'
const TABLE_PRODUCT = 'mst_product'

const COLUMN_DEFAULT = [
  `${TABLE}.specification_name`,
  `${TABLE_SPECIFICATION_LABEL}.specification_label_name`,
  `${TABLE_SPECIFICATION_VALUE}.specification_value_name`,
  `${TABLE_PRODUCT}.product_name_en`,
]

const DEFAULT_SORT = [`${TABLE}.specification_id`, 'DESC']

const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)
  if (where?.specification_id) {
    builder.where(`${TABLE}.specification_id`, where.specification_id)
  }

  if (where?.slug_product) {
    builder.where(`${TABLE_PRODUCT}.slug_product`, where.slug_product)
  }

  if (search) {
    switch (where?.language) {
      case 'id':
        builder.whereILike(`${TABLE}.specification_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      case 'en':
        builder.whereILike(`${TABLE}.specification_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      case 'cn':
        builder.whereILike(`${TABLE}.specification_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      default:
        builder.whereILike(`${TABLE}.specification_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    }
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(TABLE_SPECIFICATION_LABEL, function () {
      this.on(`${TABLE}.specification_id`, '=', `${TABLE_SPECIFICATION_LABEL}.specification_id`)
        .andOnNull(`${TABLE_SPECIFICATION_LABEL}.deleted_at`)
    })
    .leftJoin(TABLE_SPECIFICATION_VALUE, function () {
      this.on(`${TABLE_SPECIFICATION_LABEL}.specification_label_id`, '=', `${TABLE_SPECIFICATION_VALUE}.specification_label_id`)
        .andOnNull(`${TABLE_SPECIFICATION_VALUE}.deleted_at`)
    })
    .leftJoin(TABLE_PRODUCT, function () {
      this.on(`${TABLE_SPECIFICATION_VALUE}.product_id`, '=', `${TABLE_PRODUCT}.product_id`)
        .andOnNull(`${TABLE_PRODUCT}.deleted_at`)
    })

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
