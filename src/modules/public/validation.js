const { param, query, check } = require('express-validator');
const { validateMiddleware } = require('../../middlewares');
const { lang } = require('../../lang');
/* RULE
 ** More Documentation in here https://express-validator.github.io/docs/
 */
const paramArticleValidation = [
  param('article_id')
    .isUUID(4)
    .withMessage(lang.__('validator.uuid', { field: 'article_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'article_id' })),
  (req, res, next) => {
    validateMiddleware(req, res, next);
  },
];

const paramArticleSlugValidation = [
  param('article_title_slug')
    .notEmpty()
    .withMessage(
      lang.__('validator.required', { field: 'article_title_slug' })
    ),
  (req, res, next) => {
    validateMiddleware(req, res, next);
  },
];

const paramSellItValidation = [
  query('brand_id')
    .isUUID(4)
    .withMessage(lang.__('validator.uuid', { field: 'brand_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'brand_id' })),
  query('type_id')
    .isUUID(4)
    .withMessage(lang.__('validator.uuid', { field: 'type_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'type_id' })),
  query('year')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'year' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'year' })),
  (req, res, next) => {
    validateMiddleware(req, res, next);
  },
];

const sellItValidation = [
  check('titip_jual_id')
    .isUUID(4)
    .withMessage(lang.__('validator.uuid', { field: 'titip_jual_id' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'titip_jual_id' })),
  check('name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'name' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'name' })),
  check('phone_number')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'phone_number' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'phone_number' })),
  (req, res, next) => {
    validateMiddleware(req, res, next);
  },
];

const auctionListValidation = [
  query('location_pool_name')
    .optional(true)
    .isString()
    .escape(),
  (req, res, next) => {
    validateMiddleware(req, res, next);
  },
];

module.exports = {
  paramArticleValidation,
  auctionListValidation,
  paramSellItValidation,
  sellItValidation,
  paramArticleSlugValidation,
};
