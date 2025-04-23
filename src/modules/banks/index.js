const express = require('express')
const multer = require('multer')
const {
  store, fetch, fetchByParam, update, softDelete
} = require('./handler')
const { postValidation, putValidation } = require('./validation')

const router = express.Router()
const upload = multer()
/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', upload.any(), postValidation, store)
router.get('/', fetch)
router.get('/:id', fetchByParam)
router.put('/:id', upload.any(), putValidation, update)
router.delete('/:id', softDelete)

module.exports = router
