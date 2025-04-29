const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('product_category_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Category Name' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Category Name', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Product Category Name' }))
    .custom(async (value) => {
      const msg = `Product Category Name ${value}`
      const condition = {
        product_category_name: value
      }
      await checkSameValueinDb('mst_product_category', condition, 'product_category_name', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('product_category_name')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Product Category Name', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Product Category Name' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { product_category_name: value }
      const msg = lang.__('data.exist', { msg: `Product Category Name ${value}` })
      await checkSameValueinDbUpdateUuid('mst_product_category', condition, 'product_category_id', req?.params?.product_category_id, msg)
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('product_category_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'product_category_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'product_category_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
