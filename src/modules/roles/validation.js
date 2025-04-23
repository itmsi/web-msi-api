const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('role_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Role Name' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Role Name' }))
    .custom(async (value) => {
      const msg = `Role Name ${value}`
      await checkSameValueinDb('mst_role', { role_name: value }, 'role_name', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('role_name')
    .custom(async (value, { req }) => {
      const msg = `Role Name ${value}`
      await checkSameValueinDbUpdateUuid('mst_role', { role_name: value }, 'role_id', req?.params?.role_id, lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('role_id')
    .isUUID(4)
    .withMessage(lang.__('validator.uuid', { field: 'role_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'role_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
