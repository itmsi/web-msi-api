const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('solution_title_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Title ID' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Solution Title ID' }))
    .custom(async (value) => {
      const msg = `Solution Title ${value}`
      const condition = {
        solution_title_id: value
      }
      await checkSameValueinDb('mst_solution_content', condition, 'solution_title_id', lang.__('data.exist', { msg }))
    }),
  check('solution_title_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Title EN' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Solution Title EN' })),
  check('solution_title_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Title CN' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Solution Title CN' })),
  check('solution_content_body_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Content ID' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Solution Content ID' })),
  check('solution_content_body_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Content EN' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Solution Content EN' })),
  check('solution_content_body_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Content CN' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Solution Content CN' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('solution_title_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Title ID' }))
    .optional(true)
    .custom(async (value, { req }) => {
      if (!value) return true; // Skip validation if value is not provided
      const condition = { solution_title_id: value }
      const msg = lang.__('data.exist', { msg: `Solution Title ID ${value}` })
      await checkSameValueinDbUpdateUuid('mst_solution_content', condition, 'solution_content_id', req?.params?.solution_content_id, msg)
      return true; // Return true if validation passes
    }),
  check('solution_title_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Title EN' }))
    .optional(true),
  check('solution_title_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Title CN' }))
    .optional(true),
  check('solution_content_body_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Content ID' }))
    .optional(true),
  check('solution_content_body_en')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Content EN' }))
    .optional(true),
  check('solution_content_body_cn')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Solution Content CN' }))
    .optional(true),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('solution_content_id')
    .isUUID(4)
    .withMessage(lang.__('validator.uuid', { field: 'solution_content_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'solution_content_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
