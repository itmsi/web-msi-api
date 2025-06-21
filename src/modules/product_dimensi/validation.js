const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('product_model_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'Product Model' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product Model' })),
  check('product_dimensi_value')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Dimensi Value' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Dimensi Value', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product Dimensi Value' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('product_model_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Model' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Model', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product Model' })),
  check('product_dimensi_value')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Dimensi Value' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Dimensi Value', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product Dimensi Value' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('product_dimensi_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'product_dimensi_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'product_dimensi_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
