const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('first_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'First Name' }))
    .isLength({ max: 50 })
    .withMessage(lang.__('validator.max', { field: 'First Name', max: 50 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'First Name' })),

  check('last_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Last Name' }))
    .isLength({ max: 50 })
    .withMessage(lang.__('validator.max', { field: 'Last Name', max: 50 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Last Name' })),

  check('email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Email' }))
    .isLength({ max: 50 })
    .withMessage(lang.__('validator.max', { field: 'Email', max: 50 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Email' })),

  check('password')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Password' }))
    .isLength({ min: 6 })
    .withMessage(lang.__('validator.min', { field: 'Password', min: 6 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Password' })),

  check('mobile_phone')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Mobile Phone' }))
    .isLength({ max: 50 })
    .withMessage(lang.__('validator.max', { field: 'Mobile Phone', max: 50 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Mobile Phone' })),

  check('birthplace')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Birthplace' }))
    .isLength({ max: 50 })
    .withMessage(lang.__('validator.max', { field: 'Birthplace', max: 50 }))
    .optional(),

  check('birthdate')
    .isDate()
    .withMessage(lang.__('validator.date', { field: 'Birthdate' }))
    .optional(),

  check('ktp_no')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'KTP Number' }))
    .isLength({ max: 50 })
    .withMessage(lang.__('validator.max', { field: 'KTP Number', max: 50 }))
    .optional(),

  check('address')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Address' }))
    .isLength({ max: 255 })
    .withMessage(lang.__('validator.max', { field: 'Address', max: 255 }))
    .optional(),

  check('company_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Company Name' }))
    .isLength({ max: 50 })
    .withMessage(lang.__('validator.max', { field: 'Company Name', max: 50 }))
    .optional(),

  check('company_address')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Company Address' }))
    .isLength({ max: 255 })
    .withMessage(lang.__('validator.max', { field: 'Company Address', max: 255 }))
    .optional(),

  check('company_phone')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Company Phone' }))
    .isLength({ max: 50 })
    .withMessage(lang.__('validator.max', { field: 'Company Phone', max: 50 }))
    .optional(),

  check('npwp')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'NPWP' }))
    .isLength({ max: 50 })
    .withMessage(lang.__('validator.max', { field: 'NPWP', max: 50 }))
    .optional(),

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
