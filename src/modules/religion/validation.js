const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('religion_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Religion Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Religion Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Religion Name' }))
    .custom(async (value) => {
      const msg = `Religion Name ${value}`
      const condition = {
        religion_name: value
      }
      await checkSameValueinDb('mst_religion', condition, 'religion_name', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('religion_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Religion Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Religion Name' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { religion_name: value }
      const msg = lang.__('data.exist', { msg: `Religion Name ${value}` })
      await checkSameValueinDbUpdateUuid('mst_religion', condition, 'religion_id', req?.params?.religion_id, msg)
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('religion_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'religion_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'religion_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
