const { Router } = require('express')
const {
  store, storePublic, fetch, fetchByParam, update, softDelete
} = require('./handler')
const { postValidation, putValidation, paramValidation } = require('./validation')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', postValidation, store)
router.post('/public', postValidation, storePublic)
router.get('/', fetch)
router.get('/:contact_us_user_id', paramValidation, fetchByParam)
router.put('/:contact_us_user_id', putValidation, update)
router.delete('/:contact_us_user_id', softDelete)

module.exports = router
