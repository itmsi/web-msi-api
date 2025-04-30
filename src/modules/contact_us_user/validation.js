const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('contact_us_user_name_first')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Contact Us User Name First' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Contact Us User Name First', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Contact Us User Name First' }))
    .custom(async (value) => {
      const msg = `Contact Us User Name First ${value}`
      const condition = {
        contact_us_user_name_first: value
      }
      await checkSameValueinDb('mst_contact_us_user', condition, 'contact_us_user_name_first', lang.__('data.exist', { msg }))
    }),
  check('contact_us_user_email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Contact Us User Email' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Contact Us User Email' })),
  check('contact_us_user_subject')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Contact Us User Subject' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Contact Us User Subject', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Contact Us User Subject' })),
  check('contact_us_user_message')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Contact Us User Message' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Contact Us User Message' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('contact_us_user_name_first')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Contact Us User Name First', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Contact Us User Name First' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { contact_us_user_name_first: value }
      const msg = lang.__('data.exist', { msg: `Contact Us User Name First ${value}` })
      await checkSameValueinDbUpdateUuid('mst_contact_us_user', condition, 'contact_us_user_id', req?.params?.contact_us_user_id, msg)
    }),
  check('contact_us_user_email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Contact Us User Email' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Contact Us User Email' })),
  check('contact_us_user_subject')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Contact Us User Subject' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Contact Us User Subject', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Contact Us User Subject' })),
  check('contact_us_user_message')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Contact Us User Message' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Contact Us User Message' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('contact_us_user_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'contact_us_user_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'contact_us_user_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
