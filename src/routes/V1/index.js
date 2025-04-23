const express = require('express')
const { verifyToken } = require('../../middlewares')
const auth = require('../../modules/auth')
const adminMenu = require('../../modules/admin_menu')
const roles = require('../../modules/roles')
const locations = require('../../modules/locations')
const users = require('../../modules/users')
const publicApi = require('../../modules/public');
const dashboard = require('../../modules/dashboard')

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
module.exports = routing;
