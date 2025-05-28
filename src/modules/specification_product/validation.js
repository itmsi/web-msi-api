const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('specification_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Specification' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Specification' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('specification_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Specification' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Specification', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Specification' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('specification_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'specification_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'specification_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
