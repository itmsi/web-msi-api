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
const religion = require('./religion.json')
const province = require('./province.json')
const city = require('./city.json')
const degree = require('./degree.json')
const careerApply = require('./career_apply.json')
const member = require('./member.json')
const publicBanner = require('./public_banner.json')
const typeProduct = require('./type_product.json')
const publicTypeProduct = require('./public_type_product.json')
const product = require('./product.json')
const publicProduct = require('./public_product.json')
const flayerProduct = require('./flayer_product.json')
const featureProduct = require('./feature_product.json')
const featureChildProduct = require('./feature_child_product.json')
const galleryProduct = require('./gallery_product.json')

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
  ...maritalStatus,
  ...religion,
  ...province,
  ...city,
  ...degree,
  ...careerApply,
  ...member,
  ...publicBanner,
  ...typeProduct,
  ...publicTypeProduct,
  ...product,
  ...publicProduct,
  ...flayerProduct,
  ...featureProduct,
  ...featureChildProduct,
  ...galleryProduct
}
