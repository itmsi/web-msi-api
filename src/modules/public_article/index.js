const { Router } = require('express')
const {
  fetchPublic,
  fetchPublicBySlug
} = require('./handler')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.get('/', fetchPublic)
router.get('/:slug', fetchPublicBySlug)

module.exports = router
