const adminMenu = require('./admin_menu.json')
const auth = require('./auth.json')
const roles = require('./roles.json')
const location = require('./location.json')
const users = require('./users.json')
const dashboard = require('./dashboard.json')
const banner = require('./banner.json')
const newsCategory = require('./news_category.json')
const news = require('./news.json')
const contactUsAdmin = require('./contact_us_admin.json')
const contactUsUser = require('./contact_us_user.json')
const departement = require('./departement.json')
const jobCareer = require('./job_career.json')
const locationArea = require('./location_area.json')
const maritalStatus = require('./marital_status.json')

module.exports = {
  ...auth,
  ...adminMenu,
  ...roles,
  ...location,
  ...users,
  ...dashboard,
  ...banner,
  ...newsCategory,
  ...news,
  ...contactUsAdmin,
  ...contactUsUser,
  ...departement,
  ...jobCareer,
  ...locationArea,
  ...maritalStatus
}
