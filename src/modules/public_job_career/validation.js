const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('job_career_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Job Career Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Job Career Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Job Career Name' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('job_career_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Job Career Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Job Career Name' }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('job_career_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'job_career_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'job_career_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
