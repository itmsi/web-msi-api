const adminMenu = require('./admin_menu.json')
const auth = require('./auth.json')
const response = require('./response.json')
const roles = require('./roles.json')
const location = require('./location.json')
const users = require('./users.json')
const banner = require('./banner.json')
const productCategory = require('./product_category.json')

module.exports = {
  ...auth,
  ...adminMenu,
  ...response,
  ...roles,
  ...location,
  ...users,
  ...banner,
  ...productCategory
}
