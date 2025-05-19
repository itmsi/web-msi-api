const { Router } = require('express')
const {
  fetchPublic
} = require('./handler')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.get('/', fetchPublic)

module.exports = router
