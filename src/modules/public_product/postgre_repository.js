const { pgCore } = require('../../config/database')
const {
  mappingError,
  mappingSuccessPagination,
  manipulateDate
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_product'
const TYPE_TABLE = 'mst_type_product'
const FLAYER_TABLE = 'mst_flayer_product'
const FEATURE_TABLE = 'mst_feature_product'
const FEATURE_CHILD_TABLE = 'mst_feature_child_product'
const GALLERY_TABLE = 'mst_gallery_product'
const PRODUCT_360_TABLE = 'mst_360_product'

const COLUMN_DEFAULT = [
  `${TABLE}.product_id`, `${TABLE}.type_product_id`, `${TABLE}.product_name_id`, `${TABLE}.product_name_en`, `${TABLE}.product_name_cn`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`,
  `${TYPE_TABLE}.type_product_name_id`, `${TYPE_TABLE}.type_product_name_en`, `${TYPE_TABLE}.type_product_name_cn`,
  `${FLAYER_TABLE}.flayer_product_id`,
  `${FLAYER_TABLE}.flayer_product_name_id`,
  `${FLAYER_TABLE}.flayer_product_name_en`,
  `${FLAYER_TABLE}.flayer_product_name_cn`,
  `${FLAYER_TABLE}.flayer_product_description`,
  `${FLAYER_TABLE}.flayer_product_file`,
  `${FEATURE_TABLE}.feature_product_id`,
  `${FEATURE_TABLE}.feature_product_title_id`,
  `${FEATURE_TABLE}.feature_product_title_en`,
  `${FEATURE_TABLE}.feature_product_title_cn`,
  `${FEATURE_TABLE}.feature_product_description_id`,
  `${FEATURE_TABLE}.feature_product_description_en`,
  `${FEATURE_TABLE}.feature_product_description_cn`,
  `${FEATURE_CHILD_TABLE}.feature_child_product_id`,
  `${FEATURE_CHILD_TABLE}.feature_child_product_title_id`,
  `${FEATURE_CHILD_TABLE}.feature_child_product_title_en`,
  `${FEATURE_CHILD_TABLE}.feature_child_product_title_cn`,
  `${FEATURE_CHILD_TABLE}.feature_child_product_description_id`,
  `${FEATURE_CHILD_TABLE}.feature_child_product_description_en`,
  `${FEATURE_CHILD_TABLE}.feature_child_product_description_cn`,
  `${FEATURE_CHILD_TABLE}.feature_child_product_image`,
  `${GALLERY_TABLE}.gallery_product_id`,
  `${GALLERY_TABLE}.gallery_product_image`,
  `${PRODUCT_360_TABLE}.product_360_id`,
  `${PRODUCT_360_TABLE}.product_360_image`
]

const DEFAULT_SORT = [`${TABLE}.product_id`, 'DESC']

const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)
  if (where?.product_id) {
    builder.where(`${TABLE}.product_id`, where.product_id)
  }

  if (where?.type_product_id) {
    builder.where(`${TYPE_TABLE}.type_product_id`, where.type_product_id)
  }

  if (search) {
    switch (where?.language) {
      case 'id':
        builder.whereILike(`${TABLE}.product_name_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      case 'en':
        builder.whereILike(`${TABLE}.product_name_en`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      case 'cn':
        builder.whereILike(`${TABLE}.product_name_cn`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        break;
      default:
        builder.whereILike(`${TABLE}.product_name_id`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        builder.orWhereILike(`${TABLE}.product_name_en`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
        builder.orWhereILike(`${TABLE}.product_name_cn`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    }
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(TYPE_TABLE, `${TABLE}.type_product_id`, `${TYPE_TABLE}.type_product_id`)
    .leftJoin(FLAYER_TABLE, `${TABLE}.product_id`, `${FLAYER_TABLE}.product_id`)
    .leftJoin(FEATURE_TABLE, `${TABLE}.product_id`, `${FEATURE_TABLE}.product_id`)
    .leftJoin(FEATURE_CHILD_TABLE, `${FEATURE_TABLE}.feature_product_id`, `${FEATURE_CHILD_TABLE}.feature_product_id`)
    .leftJoin(GALLERY_TABLE, `${TABLE}.product_id`, `${GALLERY_TABLE}.product_id`)
    .leftJoin(PRODUCT_360_TABLE, `${TABLE}.product_id`, `${PRODUCT_360_TABLE}.product_id`)

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

    const [rows] = await sql(where, filter.search).clone().count(`${TABLE}.product_id`)

    // Transform the result to group by product and its related data
    const transformedResult = result.reduce((acc, curr) => {
      const productId = curr.product_id

      if (!acc[productId]) {
        acc[productId] = {
          product_id: curr.product_id,
          type_product_id: curr.type_product_id,
          product_name_id: curr.product_name_id,
          product_name_en: curr.product_name_en,
          product_name_cn: curr.product_name_cn,
          type_product: {
            type_product_name_id: curr.type_product_name_id,
            type_product_name_en: curr.type_product_name_en,
            type_product_name_cn: curr.type_product_name_cn
          },
          flayer: {
            flayer_product_id: curr.flayer_product_id,
            flayer_product_name_id: curr.flayer_product_name_id,
            flayer_product_name_en: curr.flayer_product_name_en,
            flayer_product_name_cn: curr.flayer_product_name_cn,
            flayer_product_description: curr.flayer_product_description,
            flayer_product_file: curr.flayer_product_file
          },
          features: [],
          galleries: [],
          product_360: []
        }
      }

      // Add feature if exists and not already added
      const hasFeature = curr.feature_product_id
        && !acc[productId].features.find((f) => f.feature_product_id === curr.feature_product_id)

      if (hasFeature) {
        const feature = {
          feature_product_id: curr.feature_product_id,
          feature_product_title_id: curr.feature_product_title_id,
          feature_product_title_en: curr.feature_product_title_en,
          feature_product_title_cn: curr.feature_product_title_cn,
          feature_product_description_id: curr.feature_product_description_id,
          feature_product_description_en: curr.feature_product_description_en,
          feature_product_description_cn: curr.feature_product_description_cn,
          feature_children: []
        }

        // Add feature child if exists
        if (curr.feature_child_product_id) {
          feature.feature_children.push({
            feature_child_product_id: curr.feature_child_product_id,
            feature_child_product_title_id: curr.feature_child_product_title_id,
            feature_child_product_title_en: curr.feature_child_product_title_en,
            feature_child_product_title_cn: curr.feature_child_product_title_cn,
            feature_child_product_description_id: curr.feature_child_product_description_id,
            feature_child_product_description_en: curr.feature_child_product_description_en,
            feature_child_product_description_cn: curr.feature_child_product_description_cn,
            feature_child_product_image: curr.feature_child_product_image
          })
        }

        acc[productId].features.push(feature)
      }

      // Add gallery if exists and not already added
      const hasGallery = curr.gallery_product_id
        && !acc[productId].galleries.find((g) => g.gallery_product_id === curr.gallery_product_id)

      if (hasGallery) {
        acc[productId].galleries.push({
          gallery_product_id: curr.gallery_product_id,
          gallery_product_image: curr.gallery_product_image
        })
      }

      // Add product 360 if exists and not already added
      const hasProduct360 = curr.product_360_id
        && !acc[productId].product_360.find((p) => p.product_360_id === curr.product_360_id)

      if (hasProduct360) {
        acc[productId].product_360.push({
          product_360_id: curr.product_360_id,
          product_360_image: curr.product_360_image
        })
      }

      return acc
    }, {})

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(Object.values(transformedResult)),
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
