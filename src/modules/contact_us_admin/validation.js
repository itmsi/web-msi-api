const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('contact_us_admin_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Contact Us Admin Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Contact Us Admin Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Contact Us Admin Name' }))
    .custom(async (value) => {
      const msg = `Contact Us Admin Name ${value}`
      const condition = {
        contact_us_admin_name: value
      }
      await checkSameValueinDb('mst_contact_us_admin', condition, 'contact_us_admin_name', lang.__('data.exist', { msg }))
    }),
  check('contact_us_admin_email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Contact Us Admin Email' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Contact Us Admin Email' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('contact_us_admin_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Contact Us Admin Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Contact Us Admin Name' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { contact_us_admin_name: value }
      const msg = lang.__('data.exist', { msg: `Contact Us Admin Name ${value}` })
      await checkSameValueinDbUpdateUuid('mst_contact_us_admin', condition, 'contact_us_admin_id', req?.params?.contact_us_admin_id, msg)
    }),
  check('contact_us_admin_email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Contact Us Admin Email' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Contact Us Admin Email' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('contact_us_admin_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'contact_us_admin_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'contact_us_admin_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
