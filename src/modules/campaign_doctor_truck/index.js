const { Router } = require('express')
const multer = require('multer')
const {
  store, storePublic, fetch, fetchByParam, update, softDelete
} = require('./handler')
const { paramValidation, publicPostValidation } = require('./validation')

const router = Router()
const upload = multer()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', upload.any(), store)
router.post('/public', upload.any(), publicPostValidation, storePublic)
router.get('/', fetch)
router.get('/:campaign_participant_id', paramValidation, fetchByParam)
router.put('/:campaign_participant_id', upload.any(), update)
router.delete('/:campaign_participant_id', softDelete)

module.exports = router
