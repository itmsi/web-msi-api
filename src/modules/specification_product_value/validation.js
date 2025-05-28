const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('specification_label_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'Specification' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Specification' })),
  check('product_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'Product' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product' })),
  check('specification_value_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Specification Value' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Specification Value' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('specification_label_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'Specification' }))
    .optional(),
  check('product_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'Product' }))
    .optional(),
  check('specification_value_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Specification Value' }))
    .optional(),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('specification_value_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'specification_value_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'specification_value_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
