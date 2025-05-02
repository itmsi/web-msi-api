const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('marital_status_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Marital Status Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Marital Status Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Marital Status Name' }))
    .custom(async (value) => {
      const msg = `Marital Status Name ${value}`
      const condition = {
        marital_status_name: value
      }
      await checkSameValueinDb('mst_marital_status', condition, 'marital_status_name', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('marital_status_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Marital Status Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Marital Status Name' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { marital_status_name: value }
      const msg = lang.__('data.exist', { msg: `Marital Status Name ${value}` })
      await checkSameValueinDbUpdateUuid('mst_marital_status', condition, 'marital_status_id', req?.params?.marital_status_id, msg)
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('marital_status_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'marital_status_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'marital_status_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
