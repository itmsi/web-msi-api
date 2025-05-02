const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('province_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Province Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Province Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Province Name' }))
    .custom(async (value) => {
      const msg = `Province Name ${value}`
      const condition = {
        province_name: value
      }
      await checkSameValueinDb('mst_province', condition, 'province_name', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('province_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Province Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Province Name' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { province_name: value }
      const msg = lang.__('data.exist', { msg: `Province Name ${value}` })
      await checkSameValueinDbUpdateUuid('mst_province', condition, 'province_id', req?.params?.province_id, msg)
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('province_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'province_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'province_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
