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
  check('product_360_image')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product 360 Image' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product 360 Image', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product 360 Image' }))
    .custom(async (value) => {
      const msg = `Product 360 Image ${value}`
      const condition = {
        product_360_image: value,
        deleted_at: null,
      }
      await checkSameValueinDb('mst_360_product', condition, 'product_360_image', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('product_360_image')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product 360 Image', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product 360 Image' }))
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
  param('product_360_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'product_360_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'product_360_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
