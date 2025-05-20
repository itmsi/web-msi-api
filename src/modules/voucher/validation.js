const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('voucher_code')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Voucher Code' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Voucher Code', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Voucher Code' })),
  check('voucher_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Voucher Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Voucher Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Voucher Name' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('voucher_code')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Voucher Code', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Voucher Code' }))
    .optional(true),
  check('voucher_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Voucher Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Voucher Name', max: 100 }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('voucher_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'voucher_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'voucher_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
