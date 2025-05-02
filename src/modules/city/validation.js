const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('city_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'City Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'City Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'City Name' }))
    .custom(async (value) => {
      const msg = `City Name ${value}`
      const condition = {
        city_name: value
      }
      await checkSameValueinDb('mst_city', condition, 'city_name', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('city_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'City Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'City Name' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { city_name: value }
      const msg = lang.__('data.exist', { msg: `City Name ${value}` })
      await checkSameValueinDbUpdateUuid('mst_city', condition, 'city_id', req?.params?.city_id, msg)
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('city_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'city_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'city_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
