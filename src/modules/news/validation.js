const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('news_title_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Title ID' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Title ID', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Title ID' }))
    .custom(async (value) => {
      const msg = `News Title ${value}`
      const condition = {
        news_title_id: value
      }
      await checkSameValueinDb('mst_news', condition, 'news_title_id', lang.__('data.exist', { msg }))
    }),
  check('news_title_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Title EN' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Title EN', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Title EN' })),
  check('news_title_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Title CN' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Title CN', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Title CN' })),
  check('news_content_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Content ID' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Content ID' })),
  check('news_content_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Content EN' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Content EN' })),
  check('news_content_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Content CN' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Content CN' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('news_title_id')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Title ID', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Title ID' }))
    .optional(true)
    .custom(async (value, { req }) => {
      if (!value) return true; // Skip validation if value is not provided
      const condition = { news_title_id: value }
      const msg = lang.__('data.exist', { msg: `News Title ID ${value}` })
      await checkSameValueinDbUpdateUuid('mst_news', condition, 'news_id', req?.params?.news_id, msg)
      return true; // Return true if validation passes
    }),
  check('news_title_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Title EN' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Title EN', max: 100 }))
    .optional(true),
  check('news_title_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Title CN' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Title CN', max: 100 }))
    .optional(true),
  check('news_content_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Content ID' }))
    .optional(true),
  check('news_content_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Content EN' }))
    .optional(true),
  check('news_content_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Content CN' }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('news_id')
    .isUUID(4)
    .withMessage(lang.__('validator.uuid', { field: 'news_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'news_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
