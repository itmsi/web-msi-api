const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('solution_category_name_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Category Name ID' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Solution Category Name ID', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Solution Category Name ID' }))
    .custom(async (value) => {
      const msg = `Solution Category Name ${value}`
      const condition = {
        solution_category_name_id: value
      }
      await checkSameValueinDb('mst_solution_category', condition, 'solution_category_name_id', lang.__('data.exist', { msg }))
    }),
  check('solution_category_name_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Category Name EN' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Solution Category Name EN', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Solution Category Name EN' })),
  check('solution_category_name_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Category Name CN' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Solution Category Name CN', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Solution Category Name CN' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]
const putValidation = [
  check('solution_category_name_id')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Solution Category Name ID', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Category Name ID' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = { solution_category_name_id: value }
      const msg = lang.__('data.exist', { msg: `Solution Category Name ID ${value}` })
      await checkSameValueinDbUpdateUuid('mst_solution_category', condition, 'solution_category_id', req?.params?.solution_category_id, msg)
    }),
  check('solution_category_name_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Category Name EN' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Solution Category Name EN', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Solution Category Name EN' })),
  check('solution_category_name_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Category Name CN' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Solution Category Name CN', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Solution Category Name CN' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('solution_category_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'solution_category_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'solution_category_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
