const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('specification_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'Specification' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Specification' })),
  check('specification_label_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Specification Label' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Specification Label' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('specification_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'Specification' }))
    .optional(),
  check('specification_label_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Specification Label' }))
    .optional(),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('specification_label_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'specification_label_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'specification_label_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
