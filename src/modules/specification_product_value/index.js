const { Router } = require('express')
const {
  store,
  fetch,
  fetchByParam,
  update,
  softDelete,
  storeImport
} = require('./handler')
const { postValidation, putValidation, paramValidation } = require('./validation')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', postValidation, store)
router.post('/import', postValidation, storeImport)
router.get('/', fetch)
router.get('/:specification_value_id', paramValidation, fetchByParam)
router.put('/:specification_value_id', putValidation, update)
router.delete('/:specification_value_id', paramValidation, softDelete)

module.exports = router
