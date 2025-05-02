const { Router } = require('express')
const {
  store, fetch, fetchByParam, update, softDelete
} = require('./handler')
const { postValidation, putValidation, paramValidation } = require('./validation')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', postValidation, store)
router.get('/', fetch)
router.get('/:marital_status_id', paramValidation, fetchByParam)
router.put('/:marital_status_id', putValidation, update)
router.delete('/:marital_status_id', softDelete)

module.exports = router
