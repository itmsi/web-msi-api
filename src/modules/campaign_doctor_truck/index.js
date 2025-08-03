const { Router } = require('express')
const multer = require('multer')
const {
  store, fetch, fetchByParam, update, softDelete
} = require('./handler')
const { paramValidation } = require('./validation')

const router = Router()
const upload = multer()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', upload.any(), store)
router.get('/', fetch)
router.get('/:campaign_participant_id', paramValidation, fetchByParam)
router.put('/:campaign_participant_id', upload.any(), update)
router.delete('/:campaign_participant_id', softDelete)

module.exports = router
