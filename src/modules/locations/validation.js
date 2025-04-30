const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
const { VEHICLE_TYPE_ENUM } = require('../../utils')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('location_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Nama Lokasi', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Nama Lokasi' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Nama Lokasi' }))
    .custom(async (value) => {
      const msg = `Nama Lokasi ${value}`
      const condition = {
        location_name: value
      }
      await checkSameValueinDb('mst_location', condition, 'location_name', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('location_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Nama Lokasi', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Nama Lokasi' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { location_name: value }
      const msg = lang.__('data.exist', { msg: `Nama Lokasi ${value}` })
      await checkSameValueinDbUpdateUuid('mst_location', condition, 'location_id', req?.params?.location_id, msg)
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('location_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'location_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'location_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
