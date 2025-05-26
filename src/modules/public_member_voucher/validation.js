const { check, param } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb, checkSameValueinDbUpdateUuid } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('member_id')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Member ID' }))
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Member ID', max: 100 }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Member ID' }))
    .custom(async (value, { req }) => {
      const msg = `Member ID ${value}`
      const condition = {
        member_id: value,
        voucher_id: req?.body?.voucher_id
      }
      await checkSameValueinDb('member_vouchers', condition, 'member_id', lang.__('data.exist', { msg }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const putValidation = [
  check('voucher_id')
    .isLength({ max: 100 })
    .withMessage(lang.__('validator.max', { field: 'Voucher ID', max: 100 }))
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Voucher ID' }))
    .optional(true)
    .custom(async (value, { req }) => {
      const condition = {
        member_voucher_id: req?.params?.member_voucher_id,
        member_id: req?.body?.member_id
      }
      const msg = lang.__('data.exist', { msg: `Member Voucher ID ${value}` })
      await checkSameValueinDbUpdateUuid('member_vouchers', condition, 'member_voucher_id', req?.params?.member_voucher_id, msg)
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const paramValidation = [
  param('member_voucher_id')
    .isUUID(4)
    .withMessage(lang.__('validator.string', { field: 'member_voucher_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'member_voucher_id' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation, putValidation, paramValidation }
