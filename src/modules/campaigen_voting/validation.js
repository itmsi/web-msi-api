const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')

const postValidation = [
  check('campaigen_voting_email')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaigen Voting Email' }))
    .isLength({ max: 200 })
    .withMessage(lang.__('validator.max', { field: 'Campaigen Voting Email', max: 200 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Campaigen Voting Email' })),
  check('campaign_participant_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'campaign_participant_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'campaign_participant_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('campaigen_voting_email')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaigen Voting Email' }))
    .isLength({ max: 200 })
    .withMessage(lang.__('validator.max', { field: 'Campaigen Voting Email', max: 200 }))
    .optional(true),
  check('campaign_participant_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'campaign_participant_id' }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('campaigen_voting_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'campaigen_voting_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'campaigen_voting_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const publicPostValidation = [
  check('campaigen_voting_email')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Campaigen Voting Email' }))
    .isLength({ max: 200 })
    .withMessage(lang.__('validator.max', { field: 'Campaigen Voting Email', max: 200 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Campaigen Voting Email' })),
  check('campaign_participant_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'campaign_participant_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'campaign_participant_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = {
  postValidation,
  putValidation,
  paramValidation,
  publicPostValidation
}

