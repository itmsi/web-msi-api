const express = require('express')
const {
  store, fetch, fetchByParam, update, softDelete, changePermissions
} = require('./handler')
const { postValidation, putValidation, paramValidation } = require('./validation')

const router = express.Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', postValidation, store)
router.get('/', fetch)
router.get('/:role_id', paramValidation, fetchByParam)
router.put('/:role_id', paramValidation, putValidation, update)
router.put('/assign-permissions/:role_id', paramValidation, changePermissions)
router.delete('/:role_id', paramValidation, softDelete)

module.exports = router
