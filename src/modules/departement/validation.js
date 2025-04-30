const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('departement_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Departement Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Departement Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Departement Name' }))
    .custom(async (value) => {
      const msg = `Departement Name ${value}`
      const condition = {
        departement_name: value
      }
      await checkSameValueinDb('mst_departement', condition, 'departement_name', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('departement_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Departement Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Departement Name' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { departement_name: value }
      const msg = lang.__('data.exist', { msg: `Departement Name ${value}` })
      await checkSameValueinDbUpdateUuid('mst_departement', condition, 'departement_id', req?.params?.departement_id, msg)
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('departement_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'departement_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'departement_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
