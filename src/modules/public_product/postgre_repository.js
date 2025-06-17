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
  `${TABLE}.product_description_id`, `${TABLE}.product_description_en`, `${TABLE}.product_description_cn`,
  `${TABLE}.banner_product`, `${TABLE}.tagline_banner_product_id`, `${TABLE}.tagline_banner_product_en`, `${TABLE}.tagline_banner_product_cn`,
  `${TABLE}.image_product`, `${TABLE}.slug_product`, `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
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
  `${FEATURE_TABLE}.no_order`,
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
  `${PRODUCT_360_TABLE}.product_360_image`,
  `${PRODUCT_360_TABLE}.product_360_type`,
  `${PRODUCT_360_TABLE}.sub_type_name`

]

const COLUMN_GET = [
  `${TABLE}.product_id`, `${TABLE}.product_name_id`, `${TABLE}.product_name_en`, `${TABLE}.product_name_cn`,
  `${TABLE}.image_product`, `${TABLE}.slug_product`,
  `${TYPE_TABLE}.type_product_name_id`, `${TYPE_TABLE}.type_product_name_en`, `${TYPE_TABLE}.type_product_name_cn`
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
    .leftJoin(TYPE_TABLE, function () {
      this.on(`${TABLE}.type_product_id`, '=', `${TYPE_TABLE}.type_product_id`)
        .andOnNull(`${TYPE_TABLE}.deleted_at`)
    })
    .leftJoin(FLAYER_TABLE, function () {
      this.on(`${TABLE}.product_id`, '=', `${FLAYER_TABLE}.product_id`)
        .andOnNull(`${FLAYER_TABLE}.deleted_at`)
    })
    .leftJoin(FEATURE_TABLE, function () {
      this.on(`${TABLE}.product_id`, '=', `${FEATURE_TABLE}.product_id`)
        .andOnNull(`${FEATURE_TABLE}.deleted_at`)
    })
    .leftJoin(FEATURE_CHILD_TABLE, function () {
      this.on(`${FEATURE_TABLE}.feature_product_id`, '=', `${FEATURE_CHILD_TABLE}.feature_product_id`)
        .andOnNull(`${FEATURE_CHILD_TABLE}.deleted_at`)
    })
    .leftJoin(GALLERY_TABLE, function () {
      this.on(`${TABLE}.product_id`, '=', `${GALLERY_TABLE}.product_id`)
        .andOnNull(`${GALLERY_TABLE}.deleted_at`)
    })
    .leftJoin(PRODUCT_360_TABLE, function () {
      this.on(`${TABLE}.product_id`, '=', `${PRODUCT_360_TABLE}.product_id`)
        .andOnNull(`${PRODUCT_360_TABLE}.deleted_at`)
    })

  if (where != null) {
    query = query.where((builder) => {
      condition(builder, where, search)
    })
  }

  return query
}

const get = async (where, filter, column = COLUMN_GET) => {
  try {
    const query = sql(where, filter.search)
    const result = await query.clone()
      .select(column)
      .groupBy(
        `${TABLE}.product_id`,
        `${TABLE}.product_name_id`,
        `${TABLE}.product_name_en`,
        `${TABLE}.product_name_cn`,
        `${TABLE}.image_product`,
        `${TABLE}.slug_product`,
        `${TYPE_TABLE}.type_product_name_id`,
        `${TYPE_TABLE}.type_product_name_en`,
        `${TYPE_TABLE}.type_product_name_cn`
      )
      .orderBy(filter.direction || DEFAULT_SORT[0], filter.order || DEFAULT_SORT[1])
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    const [rows] = await query.clone().count(column[0])

    // Clean and limit content fields
    const cleanedResult = result.map((item) => ({
      ...item
    }));

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

const getBySlug = async (slug) => {
  try {
    const query = pgCore(TABLE)
      .leftJoin(TYPE_TABLE, function () {
        this.on(`${TABLE}.type_product_id`, '=', `${TYPE_TABLE}.type_product_id`)
          .andOnNull(`${TYPE_TABLE}.deleted_at`)
      })
      .leftJoin(FLAYER_TABLE, function () {
        this.on(`${TABLE}.product_id`, '=', `${FLAYER_TABLE}.product_id`)
          .andOnNull(`${FLAYER_TABLE}.deleted_at`)
      })
      .leftJoin(FEATURE_TABLE, function () {
        this.on(`${TABLE}.product_id`, '=', `${FEATURE_TABLE}.product_id`)
          .andOnNull(`${FEATURE_TABLE}.deleted_at`)
      })
      .leftJoin(FEATURE_CHILD_TABLE, function () {
        this.on(`${FEATURE_TABLE}.feature_product_id`, '=', `${FEATURE_CHILD_TABLE}.feature_product_id`)
          .andOnNull(`${FEATURE_CHILD_TABLE}.deleted_at`)
      })
      .leftJoin(GALLERY_TABLE, function () {
        this.on(`${TABLE}.product_id`, '=', `${GALLERY_TABLE}.product_id`)
          .andOnNull(`${GALLERY_TABLE}.deleted_at`)
      })
      .leftJoin(PRODUCT_360_TABLE, function () {
        this.on(`${TABLE}.product_id`, '=', `${PRODUCT_360_TABLE}.product_id`)
          .andOnNull(`${PRODUCT_360_TABLE}.deleted_at`)
      })
      .where(`${TABLE}.deleted_at`, null)
      .where(`${TABLE}.slug_product`, slug)

    const result = await query
      .select(COLUMN_DEFAULT)
      .orderBy(`${FEATURE_TABLE}.no_order`, 'ASC')
      .orderBy(`${TABLE}.product_id`, 'ASC')

    if (!result || result.length === 0) {
      return mappingError({
        message: lang.__('get.not_found'),
        status: 404
      })
    }

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
          product_description_id: curr.product_description_id,
          product_description_en: curr.product_description_en,
          product_description_cn: curr.product_description_cn,
          banner_product: curr.banner_product,
          tagline_banner_product_id: curr.tagline_banner_product_id,
          tagline_banner_product_en: curr.tagline_banner_product_en,
          tagline_banner_product_cn: curr.tagline_banner_product_cn,
          image_product: curr.image_product,
          slug_product: curr.slug_product,
          type_product: {
            type_product_name_id: curr.type_product_name_id,
            type_product_name_en: curr.type_product_name_en,
            type_product_name_cn: curr.type_product_name_cn
          },
          flayers: [],
          features: [],
          galleries: [],
          product_360: {}
        }
      }

      // Add flayer if exists and not already added
      if (curr.flayer_product_id) {
        const flayerExists = acc[productId].flayers.some(
          (flayer) => flayer.flayer_product_id === curr.flayer_product_id
        )

        if (!flayerExists) {
          acc[productId].flayers.push({
            flayer_product_id: curr.flayer_product_id,
            flayer_product_name_id: curr.flayer_product_name_id,
            flayer_product_name_en: curr.flayer_product_name_en,
            flayer_product_name_cn: curr.flayer_product_name_cn,
            flayer_product_description: curr.flayer_product_description,
            flayer_product_file: curr.flayer_product_file
          })
        }
      }

      // Handle features and their children
      if (curr.feature_product_id) {
        // Find existing feature or create new one
        const findFeature = (f) => f.feature_product_id === curr.feature_product_id
        let feature = acc[productId].features.find(findFeature)

        if (!feature) {
          feature = {
            feature_product_id: curr.feature_product_id,
            feature_product_title_id: curr.feature_product_title_id,
            feature_product_title_en: curr.feature_product_title_en,
            feature_product_title_cn: curr.feature_product_title_cn,
            feature_product_description_id: curr.feature_product_description_id,
            feature_product_description_en: curr.feature_product_description_en,
            feature_product_description_cn: curr.feature_product_description_cn,
            feature_children: [],
            no_order: curr.no_order
          }
          acc[productId].features.push(feature)
        }

        // Add feature child if exists and not already added
        if (curr.feature_child_product_id) {
          const childExists = feature.feature_children.some(
            (child) => child.feature_child_product_id === curr.feature_child_product_id
          )

          if (!childExists) {
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
        }
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

      // Add product 360 if exists and group by type
      if (curr.product_360_id) {
        const type = curr.product_360_type || 'default'

        if (type === 'interior' && curr.sub_type_name) {
          // For interior type, store just the image path
          const subType = curr.sub_type_name
          const key = `interior_${subType}`

          acc[productId].product_360[key] = curr.product_360_image
        } else if (type === 'exterior') {
          // For exterior type, keep array structure
          if (!acc[productId].product_360[type]) {
            acc[productId].product_360[type] = []
          }

          // Check if this product_360_id is not already added
          const exists = acc[productId].product_360[type]
            .find((p) => p.product_360_id === curr.product_360_id)
          if (!exists) {
            acc[productId].product_360[type].push({
              product_360_id: curr.product_360_id,
              product_360_image: curr.product_360_image
            })
          }
        } else {
          // For other types, store as single object
          acc[productId].product_360[type] = {
            product_360_image: curr.product_360_image
          }
        }
      }

      return acc
    }, {})

    // Sort features by no_order
    Object.values(transformedResult).forEach((product) => {
      if (product.features && product.features.length > 0) {
        product.features.sort((a, b) => {
          // Handle null/undefined no_order values
          const orderA = a.no_order ? parseInt(a.no_order, 10) : 999999
          const orderB = b.no_order ? parseInt(b.no_order, 10) : 999999
          return orderA - orderB
        })
      }
    })

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(Object.values(transformedResult)[0], false),
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
