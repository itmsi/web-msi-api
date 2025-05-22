const { check } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('company_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Company Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Company Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Company Name' })),
  check('email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Email' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Email' })),
  check('phone')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Phone' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Phone', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Phone' })),
  check('mining_type')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Mining Type' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Mining Type', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Mining Type' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('company_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Company Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Company Name' }))
    .optional(true),
  check('email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Email' }))
    .optional(true),
  check('phone')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Phone' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Phone', max: 100 }))
    .optional(true),
  check('mining_type')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Mining Type' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Mining Type', max: 100 }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation }
