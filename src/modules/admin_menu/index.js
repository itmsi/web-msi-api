const express = require('express')
const { fetch, fetchAccess } = require('./handler')

const router = express.Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.get('/', fetch)
router.get('/access-list', fetchAccess)

module.exports = router
