const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('type_product_name_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Type Product Name ID' }))
    .isLength({ max: 200 })
    .withMessage(lang.__('validator.max', { field: 'Type Product Name ID', max: 200 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Type Product Name ID' }))
    .custom(async (value) => {
      const msg = `Type Product Name ${value}`
      const condition = {
        type_product_name_id: value
      }
      await checkSameValueinDb('mst_type_product', condition, 'type_product_name_id', lang.__('data.exist', { msg }))
    }),
  check('type_product_name_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Type Product Name EN' }))
    .isLength({ max: 200 })
    .withMessage(lang.__('validator.max', { field: 'Type Product Name EN', max: 200 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Type Product Name EN' })),
  check('type_product_name_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Type Product Name CN' }))
    .isLength({ max: 200 })
    .withMessage(lang.__('validator.max', { field: 'Type Product Name CN', max: 200 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Type Product Name CN' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('type_product_name_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Type Product Name ID' }))
    .isLength({ max: 200 })
    .withMessage(lang.__('validator.max', { field: 'Type Product Name ID', max: 200 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Type Product Name ID' }))
    .custom(async (value, { req }) => {
      const condition = { type_product_name_id: value }
      const msg = lang.__('data.exist', { msg: `Type Product Name ${value}` })
      await checkSameValueinDbUpdateUuid('mst_type_product', condition, 'type_product_id', req?.params?.type_product_id, msg)
    }),
  check('type_product_name_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Type Product Name EN' }))
    .isLength({ max: 200 })
    .withMessage(lang.__('validator.max', { field: 'Type Product Name EN', max: 200 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Type Product Name EN' })),
  check('type_product_name_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Type Product Name CN' }))
    .isLength({ max: 200 })
    .withMessage(lang.__('validator.max', { field: 'Type Product Name CN', max: 200 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Type Product Name CN' })),
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
