const { Router } = require('express')
const {
  store, storePublic, fetch, fetchByParam, update, softDelete
} = require('./handler')
const { postValidation, putValidation } = require('./validation')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', postValidation, storePublic)
router.post('/public/consultation', postValidation, storePublic)
router.get('/', fetch)
router.get('/:consultation_id', fetchByParam)
router.put('/:consultation_id', putValidation, update)
router.delete('/:consultation_id', softDelete)

module.exports = router
