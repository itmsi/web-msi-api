const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('news_title')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Title', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Title' }))
    .custom(async (value) => {
      const msg = `News Title ${value}`
      const condition = {
        news_title: value
      }
      await checkSameValueinDb('mst_news', condition, 'news_title', lang.__('data.exist', { msg }))
    }),
  check('news_content')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Content' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Content' })),
  check('news_status')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Status' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Status', max: 100 }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('news_category_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Category Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Category Name' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { news_category_name: value }
      const msg = lang.__('data.exist', { msg: `News Category Name ${value}` })
      await checkSameValueinDbUpdateUuid('mst_news_category', condition, 'news_category_id', req?.params?.news_category_id, msg)
    }),
  check('news_content')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Content' }))
    .optional(true),
  check('news_status')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Status' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Status', max: 100 }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('news_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'news_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'news_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
