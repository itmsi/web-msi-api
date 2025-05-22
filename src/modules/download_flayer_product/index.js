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
router.get('/', fetch)
router.get('/:data_download_flayer_produk_id', fetchByParam)
router.put('/:data_download_flayer_produk_id', putValidation, update)
router.delete('/:data_download_flayer_produk_id', softDelete)

module.exports = router
