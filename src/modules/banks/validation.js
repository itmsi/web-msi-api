const { check } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdate } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('description')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Description' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Description' })),
  check('bank_code_midtrans')
    .optional({ nullable: true })
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Bank Code Midtrans' }))
    .custom(async (value) => {
      const msg = `Bank Code Midtrans ${value}`
      if (value !== '') {
        const condition = {
          bank_code_midtrans: value,
        }
        await checkSameValueinDb('mst_bank', condition, 'bank_code_midtrans', lang.__('data.exist', { msg }))
      }
    }),
  check('admin_fee')
    .optional({ nullable: true })
    .isInt()
    .withMessage(lang.__('validator.num', { field: 'Admin Fee' })),
  check('status')
    .isInt()
    .withMessage(lang.__('validator.num', { field: 'Status' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Status' })),
  check('bank_image')
    .custom(async (_, { req }) => {
      if (!req.files) {
        throw new Error(lang.__('validator.required', { field: 'Bank Image' }))
      }
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('bank_code_midtrans')
    .optional(true)
    .custom(async (value, { req }) => {
      if (value !== '') {
        const condition = { bank_code_midtrans: value }
        const msg = lang.__('data.exist', { msg: `Bank code midtrans ${value}` })
        await checkSameValueinDbUpdate('mst_bank', condition, 'id', req?.params?.id, msg)
      }
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation }
