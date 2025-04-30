const adminMenu = require('./admin_menu.json')
const auth = require('./auth.json')
const response = require('./response.json')
const roles = require('./roles.json')
const location = require('./location.json')
const users = require('./users.json')
const banner = require('./banner.json')
const newsCategory = require('./news_category.json')
const news = require('./news.json')
const contactUsAdmin = require('./contact_us_admin.json')
const contactUsUser = require('./contact_us_user.json')
const departement = require('./departement.json')

module.exports = {
  ...auth,
  ...adminMenu,
  ...response,
  ...roles,
  ...location,
  ...users,
  ...banner,
  ...newsCategory,
  ...news,
  ...contactUsAdmin,
  ...contactUsUser,
  ...departement
}
