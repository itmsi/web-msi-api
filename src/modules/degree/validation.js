const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('degree_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Degree Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Degree Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Degree Name' }))
    .custom(async (value) => {
      const msg = `Degree Name ${value}`
      const condition = {
        degree_name: value
      }
      await checkSameValueinDb('mst_degree', condition, 'degree_name', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('degree_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Degree Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Degree Name' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { degree_name: value }
      const msg = lang.__('data.exist', { msg: `Degree Name ${value}` })
      await checkSameValueinDbUpdateUuid('mst_degree', condition, 'degree_id', req?.params?.degree_id, msg)
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('degree_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'degree_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'degree_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
