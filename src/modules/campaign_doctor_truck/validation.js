const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('participant_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaign Participant Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Campaign Participant Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Campaign Participant Name' })),
  check('participant_phone')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaign Participant Phone' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Campaign Participant Phone', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Campaign Participant Phone' })),
  check('participant_company')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaign Participant Company' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Campaign Participant Company', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Campaign Participant Company' })),
  check('participant_department')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaign Participant Department' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Campaign Participant Department', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Campaign Participant Department' })),
  check('participant_file_name_pdf')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaign Participant File Name PDF' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Campaign Participant File Name PDF', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Campaign Participant File Name PDF' })),
  check('participant_file_name_img')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaign Participant File Name IMG' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Campaign Participant File Name IMG', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Campaign Participant File Name IMG' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('participant_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaign Participant Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Campaign Participant Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Campaign Participant Name' })),
  check('participant_phone')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaign Participant Phone' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Campaign Participant Phone', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Campaign Participant Phone' })),
  check('participant_company')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaign Participant Company' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Campaign Participant Company', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Campaign Participant Company' })),
  check('participant_department')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaign Participant Department' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Campaign Participant Department', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Campaign Participant Department' })),
  check('participant_file_name_pdf')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaign Participant File Name PDF' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Campaign Participant File Name PDF', max: 100 }))
    .optional(true),
  check('participant_file_name_img')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaign Participant File Name IMG' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Campaign Participant File Name IMG', max: 100 }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('campaign_participant_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'campaign_participant_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'campaign_participant_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
