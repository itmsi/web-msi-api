const { Router } = require('express')
const {
  fetchPublic,
  fetchAllPublic,
  fetchRawPublic
} = require('./handler')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.get('/', fetchPublic)
router.get('/all', fetchAllPublic)
router.get('/raw', fetchRawPublic)

module.exports = router
