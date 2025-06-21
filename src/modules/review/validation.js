const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('review_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Review Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Review Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Review Name' })),
  check('review_email')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Review Email' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Review Email', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Review Email' })),
  check('review_type_of_review')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Review Type of Review' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Review Type of Review', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Review Type of Review' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('review_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Review Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Review Name' }))
    .optional(true),
  check('review_email')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Review Email' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Review Email', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Review Email' })),
  check('review_type_of_review')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Review Type of Review' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Review Type of Review', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Review Type of Review' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('review_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'review_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'review_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
