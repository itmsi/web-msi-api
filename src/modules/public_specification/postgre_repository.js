const { pgCore } = require('../../config/database')
const {
  mappingError,
  mappingSuccessPagination
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_specifications'
const TABLE_SPECIFICATION_LABEL = 'mst_specification_labels'
const TABLE_SPECIFICATION_VALUE = 'mst_specification_values'
const TABLE_PRODUCT = 'mst_product'
const TABLE_PRODUCT_MODEL = 'mst_product_model'
const TABLE_PRODUCT_DIMENSI = 'mst_product_dimensi'

const COLUMN_DEFAULT = [
  `${TABLE}.specification_name`,
  `${TABLE_SPECIFICATION_LABEL}.specification_label_name`,
  `${TABLE_SPECIFICATION_VALUE}.specification_value_name`,
  `${TABLE_PRODUCT}.product_name_en`,
  `${TABLE_PRODUCT_MODEL}.product_model_name`,
  `${TABLE_PRODUCT_MODEL}.product_model_foto`,
  `${TABLE_PRODUCT_DIMENSI}.product_dimensi_value`,
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
    })
    .leftJoin(TABLE_SPECIFICATION_VALUE, function () {
      this.on(`${TABLE_SPECIFICATION_LABEL}.specification_label_id`, '=', `${TABLE_SPECIFICATION_VALUE}.specification_label_id`)
      this.on(`${TABLE_SPECIFICATION_VALUE}.deleted_at`, '=', null)
    })
    .leftJoin(TABLE_PRODUCT_DIMENSI, function () {
      this.on(`${TABLE_SPECIFICATION_VALUE}.product_dimensi_id`, '=', `${TABLE_PRODUCT_DIMENSI}.product_dimensi_id`)
    })
    .leftJoin(TABLE_PRODUCT_MODEL, function () {
      this.on(`${TABLE_PRODUCT_DIMENSI}.product_model_id`, '=', `${TABLE_PRODUCT_MODEL}.product_model_id`)
    })
    .leftJoin(TABLE_PRODUCT, function () {
      this.on(`${TABLE_PRODUCT_MODEL}.product_id`, '=', `${TABLE_PRODUCT}.product_id`)
    })

  if (where != null) {
    query = query.where((builder) => {
      condition(builder, where, search)
    })
  }

  return query
}

// Function to transform flat data into nested structure
const transformToNestedStructure = (flatData) => {
  const products = {}

  flatData.forEach((row) => {
    const productName = row.product_name_en
    const modelName = row.product_model_name
    const dimensiValue = row.product_dimensi_value
    const specificationName = row.specification_name
    const labelName = row.specification_label_name
    const valueName = row.specification_value_name
    const modelFoto = row.product_model_foto

    // Skip if any required field is null/undefined
    if (!productName || !modelName || !dimensiValue
        || !specificationName || !labelName || !valueName) {
      return
    }

    // Initialize product if not exists
    if (!products[productName]) {
      products[productName] = {
        product_name_en: productName,
        product_model: {}
      }
    }

    // Initialize model if not exists
    if (!products[productName].product_model[modelName]) {
      products[productName].product_model[modelName] = {
        product_model_name: modelName,
        product_model_foto: modelFoto,
        product_dimensi: {}
      }
    }

    // Initialize dimensi if not exists
    if (!products[productName].product_model[modelName].product_dimensi[dimensiValue]) {
      products[productName].product_model[modelName].product_dimensi[dimensiValue] = {
        product_dimensi_value: dimensiValue,
        specification: []
      }
    }

    // Add specification to array instead of using object with unique keys
    // This allows multiple specifications with the same name and label
    const existingSpec = products[productName].product_model[modelName]
      .product_dimensi[dimensiValue].specification.find(
        (spec) => spec.specification_name === specificationName
                && spec.specification_label_name === labelName
                && spec.specification_value_name === valueName
      )

    if (!existingSpec) {
      products[productName].product_model[modelName]
        .product_dimensi[dimensiValue].specification.push({
          specification_name: specificationName,
          specification_label_name: labelName,
          specification_value_name: valueName
        })
    }
  })

  // Convert objects to arrays
  const result = Object.values(products).map((product) => ({
    product_name_en: product.product_name_en,
    product_model: Object.values(product.product_model).map((model) => ({
      product_model_name: model.product_model_name,
      product_model_foto: model.product_model_foto,
      product_dimensi: Object.values(model.product_dimensi).map((dimensi) => ({
        product_dimensi_value: dimensi.product_dimensi_value,
        specification: dimensi.specification // Already an array
      }))
    }))
  }))

  return result
}

const get = async (where, filter, column = COLUMN_DEFAULT) => {
  try {
    const result = await sql(where, filter.search).clone()
      .select(column)
      .orderBy(`${filter.direction}`, filter.order)
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    const [rows] = await sql(where, filter.search).clone().count(column[0])

    // Transform the flat data to nested structure
    const nestedResult = transformToNestedStructure(result)

    return mappingSuccessPagination(lang.__('get.success'), {
      result: nestedResult,
      count: rows?.count
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

const getAll = async (where, column = COLUMN_DEFAULT) => {
  try {
    const result = await sql(where, false).clone()
      .select(column)
      .orderBy(`${TABLE}.specification_id`, 'DESC')

    // Transform the flat data to nested structure
    const nestedResult = transformToNestedStructure(result)

    return mappingSuccessPagination(lang.__('get.success'), {
      result: nestedResult,
      count: result.length
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

const getRaw = async (where, filter, column = COLUMN_DEFAULT) => {
  try {
    const result = await sql(where, filter.search).clone()
      .select(column)
      .orderBy(`${filter.direction}`, filter.order)
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    const [rows] = await sql(where, filter.search).clone().count(column[0])

    return mappingSuccessPagination(lang.__('get.success'), {
      result,
      count: rows?.count
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  get,
  getAll,
  getRaw,
  COLUMN_DEFAULT,
  DEFAULT_SORT,
  TABLE
}
