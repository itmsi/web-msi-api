const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('type_product_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'Type Product' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Type Product' })),
  check('product_name_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product Name' })),
  check('product_name_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product Name' })),
  check('product_name_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product Name' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('product_name_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product Name' })),
  check('product_name_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Name', max: 100 }))
    .optional(true),
  check('product_name_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Name', max: 100 }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('product_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'product_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'product_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
