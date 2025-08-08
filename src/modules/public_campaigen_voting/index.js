const { Router } = require('express')
const { fetchPublic, fetchParticipants } = require('./handler')
const { publicPostValidation } = require('../campaigen_voting/validation')
const { storePublic } = require('../campaigen_voting/handler')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.get('/', fetchPublic)
router.post('/', publicPostValidation, storePublic)
router.get('/participants', fetchParticipants)

module.exports = router
