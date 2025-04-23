const { check } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
const { checkSameValueinDb } = require('../../repository/postgres/core_postgres')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const postValidation = [
  check('name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Name' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Name' }))
    .custom(async (value) => {
      await checkSameValueinDb('mst_color', value, 'name', lang.__('data.exist', { msg: 'Name' }))
    }),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

module.exports = { postValidation }
