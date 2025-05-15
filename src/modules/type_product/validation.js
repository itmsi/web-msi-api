const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('type_product_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Type Product Name' }))
    .isLength({ max: 200 })
    .withMessage(lang.__('validator.max', { field: 'Type Product Name', max: 200 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Type Product Name' }))
    .custom(async (value) => {
      const msg = `Type Product Name ${value}`
      const condition = {
        type_product_name: value
      }
      await checkSameValueinDb('mst_type_product', condition, 'type_product_name', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('type_product_name')
    .isLength({ max: 200 })
    .withMessage(lang.__('validator.max', { field: 'Type Product Name', max: 200 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Type Product Name' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { type_product_name: value }
      const msg = lang.__('data.exist', { msg: `Type Product Name ${value}` })
      await checkSameValueinDbUpdateUuid('mst_type_product', condition, 'type_product_id', req?.params?.type_product_id, msg)
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('type_product_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'type_product_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'type_product_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
