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
router.get('/:solution_content_id', paramValidation, fetchByParam)
router.put('/:solution_content_id', putValidation, update)
router.delete('/:solution_content_id', softDelete)

module.exports = router
