const { Router } = require('express')
const { fetchPublic } = require('./handler')
const { publicPostValidation } = require('../campaigen_voting/validation')
const { storePublic } = require('../campaigen_voting/handler')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.get('/', fetchPublic)
router.post('/', publicPostValidation, storePublic)

module.exports = router
