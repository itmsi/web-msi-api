const { Router } = require('express')
const {
  store,
  fetch,
  fetchByParam,
  update,
  softDelete
} = require('./handler')
const { postValidation, putValidation, paramValidation } = require('./validation')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', postValidation, store)
router.get('/', fetch)
router.get('/:specification_label_id', paramValidation, fetchByParam)
router.put('/:specification_label_id', putValidation, update)
router.delete('/:specification_label_id', paramValidation, softDelete)

module.exports = router
