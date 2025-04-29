const adminMenu = require('./admin_menu.json')
const auth = require('./auth.json')
const roles = require('./roles.json')
const location = require('./location.json')
const users = require('./users.json')
const dashboard = require('./dashboard.json')
const banner = require('./banner.json')
const newsCategory = require('./news_category.json')
const news = require('./news.json')

module.exports = {
  ...auth,
  ...adminMenu,
  ...roles,
  ...location,
  ...users,
  ...dashboard,
  ...banner,
  ...newsCategory,
  ...news
}
