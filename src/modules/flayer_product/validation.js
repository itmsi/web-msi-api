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
  check('flayer_product_name_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Flayer Product Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Flayer Product Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Flayer Product Name' })),
  check('flayer_product_name_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Flayer Product Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Flayer Product Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Flayer Product Name' })),
  check('flayer_product_name_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Flayer Product Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Flayer Product Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Flayer Product Name' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('flayer_product_name_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Flayer Product Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Flayer Product Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Flayer Product Name' })),
  check('flayer_product_name_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Flayer Product Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Flayer Product Name', max: 100 }))
    .optional(true),
  check('flayer_product_name_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Flayer Product Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Flayer Product Name', max: 100 }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('flayer_product_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'flayer_product_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'flayer_product_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
