const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('news_category_name_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Category Name ID' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Category Name ID', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Category Name ID' }))
    .custom(async (value) => {
      const msg = `News Category Name ${value}`
      const condition = {
        news_category_name_id: value
      }
      await checkSameValueinDb('mst_news_category', condition, 'news_category_name_id', lang.__('data.exist', { msg }))
    }),
  check('news_category_name_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Category Name EN' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Category Name EN', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Category Name EN' })),
  check('news_category_name_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Category Name CN' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Category Name CN', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Category Name CN' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]
const putValidation = [
  check('news_category_name_id')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Category Name ID', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Category Name ID' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { news_category_name_id: value }
      const msg = lang.__('data.exist', { msg: `News Category Name ID ${value}` })
      await checkSameValueinDbUpdateUuid('mst_news_category', condition, 'news_category_id', req?.params?.news_category_id, msg)
    }),
  check('news_category_name_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Category Name EN' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Category Name EN', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Category Name EN' })),
  check('news_category_name_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'News Category Name CN' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'News Category Name CN', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'News Category Name CN' })),
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
