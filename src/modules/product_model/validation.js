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
  check('product_model_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Model Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Model Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product Model Name' })),
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
  check('product_model_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Model Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Model Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product Model Name' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('product_model_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'product_model_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'product_model_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
