const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('career_apply_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Career Apply Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Career Apply Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Career Apply Name' })),
  check('career_apply_nik')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Career Apply Nik' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Career Apply Nik', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Career Apply Nik' })),
  check('career_apply_email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Career Apply Email' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Career Apply Email' })),
  check('career_apply_phone')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Career Apply Phone' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Career Apply Phone', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Career Apply Phone' })),
  check('career_apply_gender')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Career Apply Gender' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Career Apply Gender', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Career Apply Gender' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('career_apply_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'career_apply_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'career_apply_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, paramValidation }
