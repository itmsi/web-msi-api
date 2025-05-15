const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('page_banner')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Page Banner' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Page Banner', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Page Banner' })),
  check('order_banner')
    .isInt()
    .withMessage(lang.__('validator.integer', { field: 'Order Banner' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Order Banner' }))
    .custom(async (value, { req }) => {
      const msg = `Order Banner ${value}`
      const condition = {
        order_banner: value,
        page_banner: req.body.page_banner,
        deleted_at: null,
      }
      await checkSameValueinDb('mst_banner', condition, 'order_banner', lang.__('data.exist', { msg }))
    }),
  check('title_banner_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Title Banner' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Title Banner', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Title Banner' }))
    .custom(async (value) => {
      const msg = `Title Banner ${value}`
      const condition = {
        title_banner_id: value,
        deleted_at: null,
      }
      await checkSameValueinDb('mst_banner', condition, 'title_banner_id', lang.__('data.exist', { msg }))
    }),
  check('title_banner_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Title Banner' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Title Banner', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Title Banner' }))
    .custom(async (value) => {
      const msg = `Title Banner ${value}`
      const condition = {
        title_banner_en: value,
        deleted_at: null,
      }
      await checkSameValueinDb('mst_banner', condition, 'title_banner_en', lang.__('data.exist', { msg }))
    }),
  check('status_banner')
    .isInt()
    .withMessage(lang.__('validator.integer', { field: 'Status Banner' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Status Banner' })),
  check('title_banner_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Title Banner' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Title Banner', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Title Banner' })),
  check('file_banner')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'File Banner', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'File Banner' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'File Banner' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('page_banner')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Page Banner', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Page Banner' }))
    .optional(true),
  check('order_banner')
    .isInt()
    .withMessage(lang.__('validator.integer', { field: 'Order Banner' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const msg = `Order Banner ${value}`
      const condition = {
        order_banner: value,
        page_banner: req.body.page_banner,
        deleted_at: null,
      }
      await checkSameValueinDbUpdateUuid('mst_banner', condition, 'banner_id', req?.params?.banner_id, msg)
    }),
  check('status_banner')
    .isInt()
    .withMessage(lang.__('validator.integer', { field: 'Status Banner' }))
    .optional(true),
  check('title_banner_id')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Title Banner', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Title Banner' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { title_banner_id: value, deleted_at: null }
      const msg = lang.__('data.exist', { msg: `Title Banner ${value}` })
      await checkSameValueinDbUpdateUuid('mst_banner', condition, 'banner_id', req?.params?.banner_id, msg)
    }),
  check('title_banner_en')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Title Banner', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Title Banner' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { title_banner_en: value, deleted_at: null }
      const msg = lang.__('data.exist', { msg: `Title Banner ${value}` })
      await checkSameValueinDbUpdateUuid('mst_banner', condition, 'banner_id', req?.params?.banner_id, msg)
    }),
  check('title_banner_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Title Banner' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Title Banner', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Title Banner' })),
  check('file_banner')
    .optional(true)
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'File Banner', max: 100 })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('banner_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'banner_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'banner_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
