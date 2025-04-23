const { Router } = require('express')
const {
  store, fetch, fetchByParam, update, softDelete, changePassword,
  fetchAuctionOfficer
} = require('./handler')
const {
  postValidation, putValidation, paramValidation, changePasswordValidation
} = require('./validation')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.get('/auction-officer', fetchAuctionOfficer)

router.post('/', postValidation, store)
router.get('/', fetch)
router.get('/:users_id', paramValidation, fetchByParam)
router.put('/:users_id', putValidation, update)
router.delete('/:users_id', softDelete)
router.post('/change-password', changePasswordValidation, changePassword)

module.exports = router
