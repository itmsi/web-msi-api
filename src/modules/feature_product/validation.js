const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('product_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'Product' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product' })),
  check('feature_product_title_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Feature Product Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Feature Product Title', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Feature Product Title' })),
  check('feature_product_title_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Feature Product Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Feature Product Title', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Feature Product Title' })),
  check('feature_product_title_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Feature Product Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Feature Product Title', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Feature Product Title' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('product_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product' })),
  check('feature_product_title_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Feature Product Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Feature Product Title', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Feature Product Title' })),
  check('feature_product_title_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Feature Product Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Feature Product Title', max: 100 }))
    .optional(true),
  check('feature_product_title_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Feature Product Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Feature Product Title', max: 100 }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('feature_product_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'feature_product_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'feature_product_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
