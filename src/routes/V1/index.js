const express = require('express')
const { verifyToken } = require('../../middlewares')
const auth = require('../../modules/auth')
const adminMenu = require('../../modules/admin_menu')
const roles = require('../../modules/roles')
const locations = require('../../modules/locations')
const users = require('../../modules/users')
const publicApi = require('../../modules/public');
const dashboard = require('../../modules/dashboard')
const banner = require('../../modules/banner')
const newsCategory = require('../../modules/news_category')
const news = require('../../modules/news')
const contactUsAdmin = require('../../modules/contact_us_admin')
const contactUsUser = require('../../modules/contact_us_user')
const departement = require('../../modules/departement')

const routing = express();
const API_TAG = '/api/v1';
/* RULE
naming convention endpoint: using plural
*/
// public api register here
routing.use(`${API_TAG}/auth`, auth)
routing.use(`${API_TAG}/public/api`, publicApi)

// need token verify register here
routing.use(`${API_TAG}/admin-menu`, verifyToken, adminMenu)
routing.use(`${API_TAG}/roles`, verifyToken, roles)
routing.use(`${API_TAG}/locations`, verifyToken, locations)
routing.use(`${API_TAG}/users`, verifyToken, users)
routing.use(`${API_TAG}/dashboard`, verifyToken, dashboard)
routing.use(`${API_TAG}/banner`, verifyToken, banner)
routing.use(`${API_TAG}/news-category`, verifyToken, newsCategory)
routing.use(`${API_TAG}/news`, verifyToken, news)
routing.use(`${API_TAG}/contact-us-admin`, verifyToken, contactUsAdmin)
routing.use(`${API_TAG}/contact-us-user`, verifyToken, contactUsUser)
routing.use(`${API_TAG}/departement`, verifyToken, departement)
module.exports = routing;
