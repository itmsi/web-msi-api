const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('title_banner')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Title Banner' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Title Banner', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Title Banner' }))
    .custom(async (value) => {
      const msg = `Title Banner ${value}`
      const condition = {
        title_banner: value
      }
      await checkSameValueinDb('mst_banner', condition, 'title_banner', lang.__('data.exist', { msg }))
    }),
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
  check('title_banner')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Title Banner', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Title Banner' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { title_banner: value }
      const msg = lang.__('data.exist', { msg: `Title Banner ${value}` })
      await checkSameValueinDbUpdateUuid('mst_banner', condition, 'banner_id', req?.params?.banner_id, msg)
    }),
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
