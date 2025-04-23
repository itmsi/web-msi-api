const { check } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const siginValidation = [
  check('username')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Username' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Username' })),
  check('password')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Password' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Password' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const siginCustomerValidation = [
  check('username')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Username' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Username' })),
  check('password')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Password' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Password' })),
  check('captcha_key')
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Captcha' })),
  (req, res, next) => {
    validateMiddleware(req, res, next);
  },
];

const siginConductorValidation = [
  check('username')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Username' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Username' })),
  check('password')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Password' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Password' })),
  (req, res, next) => {
    validateMiddleware(req, res, next);
  },
];

module.exports = { siginValidation, siginCustomerValidation, siginConductorValidation }
