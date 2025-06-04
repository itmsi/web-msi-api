const { Router } = require('express')
const {
  fetch
} = require('./handler')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.get('/', fetch)

module.exports = router
