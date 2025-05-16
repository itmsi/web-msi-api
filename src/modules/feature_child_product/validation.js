const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('feature_product_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'Feature Product' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Feature Product' })),
  check('feature_child_product_title_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Feature Child Product Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Feature Child Product Title', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Feature Child Product Title' })),
  check('feature_child_product_title_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Feature Child Product Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Feature Child Product Title', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Feature Child Product Title' })),
  check('feature_child_product_title_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Feature Child Product Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Feature Child Product Title', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Feature Child Product Title' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('feature_child_product_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'Feature Child Product' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Feature Child Product' })),
  check('feature_child_product_title_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Feature Child Product Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Feature Child Product Title', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Feature Child Product Title' })),
  check('feature_child_product_title_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Feature Child Product Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Feature Child Product Title', max: 100 }))
    .optional(true),
  check('feature_child_product_title_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Feature Child Product Title' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Feature Child Product Title', max: 100 }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('feature_child_product_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'feature_child_product_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'feature_child_product_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
