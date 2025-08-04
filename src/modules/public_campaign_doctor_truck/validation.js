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
  check('approve')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Approve' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Approve', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Approve' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation }
