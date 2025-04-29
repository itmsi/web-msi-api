const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('news_category_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Category Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Category Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Category Name' }))
    .custom(async (value) => {
      const msg = `News Category Name ${value}`
      const condition = {
        news_category_name: value
      }
      await checkSameValueinDb('mst_news_category', condition, 'news_category_name', lang.__('data.exist', { msg }))
    }),
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
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('news_category_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'news_category_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'news_category_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
