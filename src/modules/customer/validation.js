const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('customer_no')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Customer No' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Customer No', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Customer No' })),
  check('first_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'First Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'First Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'First Name' })),
  check('last_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Last Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Last Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Last Name' })),
  check('email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Email' })),
  check('mobile_phone')
    .isMobilePhone()
    .withMessage(lang.__('validator.mobile_phone', { field: 'Mobile Phone' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('customer_no')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Customer No', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Customer No' }))
    .optional(true),
  check('first_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'First Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'First Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'First Name' })),
  check('last_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Last Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Last Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Last Name' })),
  check('email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Email' })),
  check('mobile_phone')
    .isMobilePhone()
    .withMessage(lang.__('validator.mobile_phone', { field: 'Mobile Phone' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('customer_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'Customer ID' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Customer ID' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
