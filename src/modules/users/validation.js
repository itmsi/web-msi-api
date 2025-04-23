const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('username')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Username' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Username' }))
    .custom(async (value) => {
      const msg = `Username ${value}`
      const condition = {
        username: value, deleted_at: null
      }
      await checkSameValueinDb('mst_users', condition, 'users_id', lang.__('data.exist', { msg }))
    }),
  check('location_id')
    .isUUID(4)
    .withMessage(lang.__('validator.uuid', { field: 'Location id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Location id' })),
  check('role_id')
    .isUUID(4)
    .withMessage(lang.__('validator.uuid', { field: 'Role id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Role id' })),
  check('full_name')
    .isString().withMessage(lang.__('validator.string', { field: 'Nama lengkap' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Nama lengkap' })),
  check('jabatan')
    .isString().withMessage(lang.__('validator.string', { field: 'Jabatan' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Jabatan' })),
  check('email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Email' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Email' }))
    .custom(async (value) => {
      const msg = `Email ${value}`
      const condition = {
        email: value, deleted_at: null
      }
      await checkSameValueinDb('mst_users', condition, 'users_id', lang.__('data.exist', { msg }))
    }),
  check('phone_number')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Phone number' }))
    .custom(async (value) => {
      const msg = `Phone number ${value}`
      const condition = {
        phone_number: value, deleted_at: null
      }
      await checkSameValueinDb('mst_users', condition, 'users_id', lang.__('data.exist', { msg }))
    }),
  check('password')
    .isLength({ min: 8, max: 12 })
    .withMessage(lang.__('validator.min-max', { field: 'Password', min: 8, max: 12 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Password' }))
    .isStrongPassword()
    .withMessage(lang.__('validator.password')),
  check('status')
    .isString()
    .default(1)
    .optional(true)
    .withMessage(lang.__('validator.bool', { field: 'Status' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Status' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('username')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Username' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { username: value, deleted_at: null }
      const msg = lang.__('data.exist', { msg: `Username ${value}` })
      await checkSameValueinDbUpdateUuid('mst_users', condition, 'users_id', req?.params?.users_id, msg)
    }),
  check('email')
    .isEmail()
    .withMessage(lang.__('validator.string', { field: 'Email' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { email: value, deleted_at: null }
      const msg = lang.__('data.exist', { msg: `Email ${value}` })
      await checkSameValueinDbUpdateUuid('mst_users', condition, 'users_id', req?.params?.users_id, msg)
    }),
  check('phone_number')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Phone number' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { phone_number: value, deleted_at: null }
      const msg = lang.__('data.exist', { msg: `Phone number ${value}` })
      await checkSameValueinDbUpdateUuid('mst_users', condition, 'users_id', req?.params?.users_id, msg)
    }),
  check('password')
    .optional(true)
    .isLength({ min: 8, max: 12 })
    .withMessage(lang.__('validator.min-max', { field: 'Password', min: 8, max: 12 }))
    .isStrongPassword()
    .withMessage(lang.__('validator.password')),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('users_id')
    .isUUID(4)
    .withMessage(lang.__('validator.uuid', { field: 'users_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'users_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const changePasswordValidation = [
  check('password')
    .isLength({ min: 8, max: 12 })
    .withMessage(lang.__('validator.min-max', { field: 'Password', min: 8, max: 12 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Password' }))
    .isStrongPassword()
    .withMessage(lang.__('validator.password')),
  check('old_password')
    .isLength({ min: 8, max: 12 })
    .withMessage(lang.__('validator.min-max', { field: 'Old Password', min: 8, max: 12 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Old Password' }))
    .isStrongPassword()
    .withMessage(lang.__('validator.password')),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = {
  postValidation, putValidation, paramValidation, changePasswordValidation
}
