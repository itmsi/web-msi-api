const adminMenu = require('./admin_menu.json')
const auth = require('./auth.json')
const roles = require('./roles.json')
const location = require('./location.json')
const users = require('./users.json')
const dashboard = require('./dashboard.json')
const banner = require('./banner.json')
const productCategory = require('./product_category.json')

module.exports = {
  ...auth,
  ...adminMenu,
  ...roles,
  ...location,
  ...users,
  ...dashboard,
  ...banner,
  ...productCategory
}
