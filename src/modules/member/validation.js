const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('member_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Member Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Member Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Member Name' })),
  check('member_email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Member Email' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Member Email' })),
  check('member_password')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Member Password' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Member Password', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Member Password' })),
  check('member_full_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Member Full Name' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Member Full Name' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('member_phone_number')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Member Phone Number', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Member Phone Number' }))
    .optional(true),
  check('member_email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Member Email' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Member Email' })),
  check('member_approval_status')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Member Approval Status' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Member Approval Status', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Member Approval Status' })),
  check('member_description')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Member Description' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Member Description' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('member_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'member_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'member_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
