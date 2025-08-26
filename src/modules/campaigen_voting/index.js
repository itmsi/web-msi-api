const { Router } = require('express')
const {
  store, storePublic, fetch, fetchByParam, update, softDelete, getVotingStats
} = require('./handler')
const { postValidation, putValidation, paramValidation, publicPostValidation } = require('./validation')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', postValidation, store)
router.post('/public', publicPostValidation, storePublic)
router.get('/', fetch)
router.get('/stats', getVotingStats)
router.get('/:campaigen_voting_id', paramValidation, fetchByParam)
router.put('/:campaigen_voting_id', putValidation, update)
router.delete('/:campaigen_voting_id', paramValidation, softDelete)

module.exports = router

