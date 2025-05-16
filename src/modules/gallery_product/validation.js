const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('product_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product ID' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product ID', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product ID' })),
  check('gallery_product_image')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Gallery Product Image' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Gallery Product Image', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Gallery Product Image' }))
    .custom(async (value) => {
      const msg = `Gallery Product Image ${value}`
      const condition = {
        gallery_product_image: value,
        deleted_at: null,
      }
      await checkSameValueinDb('mst_gallery_product', condition, 'gallery_product_image', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('gallery_product_image')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Gallery Product Image', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Gallery Product Image' }))
    .optional(true),
  check('product_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product ID' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product ID', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product ID' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('gallery_product_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'gallery_product_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'gallery_product_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
