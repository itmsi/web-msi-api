const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('location_area_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Location Area Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Location Area Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Location Area Name' }))
    .custom(async (value) => {
      const msg = `Location Area Name ${value}`
      const condition = {
        location_area_name: value
      }
      await checkSameValueinDb('mst_location_area', condition, 'location_area_name', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('location_area_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Location Area Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Location Area Name' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { location_area_name: value }
      const msg = lang.__('data.exist', { msg: `Location Area Name ${value}` })
      await checkSameValueinDbUpdateUuid('mst_location_area', condition, 'location_area_id', req?.params?.location_area_id, msg)
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('location_area_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'location_area_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'location_area_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
