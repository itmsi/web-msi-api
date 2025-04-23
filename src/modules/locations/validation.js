const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
const { VEHICLE_TYPE_ENUM } = require('../../utils')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('location_code')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Kode Lokasi' }))
    .isLength({ max: 30 })
    .withMessage(lang.__('validator.max', { field: 'Kode Lokasi', max: 30 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Kode Lokasi' }))
    .custom(async (value) => {
      const msg = `Kode Lokasi ${value}`
      const condition = {
        location_code: value
      }
      await checkSameValueinDb('mst_location', condition, 'location_code', lang.__('data.exist', { msg }))
    }),
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
  check('location_account_number')
    .isLength({ max: 25 })
    .withMessage(lang.__('validator.max', { field: 'No. Rekening', max: 25 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'No. Rekening' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'No. Rekening' })),
  check('location_code_inventory')
    .isLength({ max: 10 })
    .withMessage(lang.__('validator.max', { field: 'Kode Inventori', max: 10 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Kode Inventori' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Kode Inventori' })),
  check('location_code_accounting')
    .isLength({ max: 10 })
    .withMessage(lang.__('validator.max', { field: 'Kode Akunting', max: 10 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Kode Akunting' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Kode Akunting' })),
  check('location_detail')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Detail Lokasi', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Detail Lokasi' })),
  check('location_type')
    .isIn(VEHICLE_TYPE_ENUM)
    .withMessage(lang.__('validator.enum', { field: 'Tipe Lokasi', enum: VEHICLE_TYPE_ENUM.toString() }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Tipe Lokasi' })),
  check('location_status')
    .isLength({ max: 1 })
    .withMessage(lang.__('validator.max', { field: 'Status Lokasi', max: 1 }))
    .isString()
    .default(1)
    .optional(true)
    .withMessage(lang.__('validator.string', { field: 'Status Lokasi' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Status Lokasi' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('location_code')
    .isLength({ max: 30 })
    .withMessage(lang.__('validator.max', { field: 'Kode Lokasi', max: 30 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Kode Lokasi' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { location_code: value }
      const msg = lang.__('data.exist', { msg: `Kode Lokasi ${value}` })
      await checkSameValueinDbUpdateUuid('mst_location', condition, 'location_id', req?.params?.location_id, msg)
    }),
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
  check('location_detail')
    .optional(true)
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Detail Lokasi', max: 100 }))
    .optional(true),
  check('location_account_number')
    .optional(true)
    .isLength({ max: 25 })
    .withMessage(lang.__('validator.max', { field: 'No. Rekening', max: 25 })),
  check('location_code_inventory')
    .optional(true)
    .isLength({ max: 10 })
    .withMessage(lang.__('validator.max', { field: 'Kode Inventori', max: 10 })),
  check('location_code_accounting')
    .optional(true)
    .isLength({ max: 10 })
    .withMessage(lang.__('validator.max', { field: 'Kode Akunting', max: 10 })),
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
