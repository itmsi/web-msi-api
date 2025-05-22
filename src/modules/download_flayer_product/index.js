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
router.post('/public/download-flayer-product', postValidation, store)
router.get('/', fetch)
router.get('/:data_download_flayer_produk_id', paramValidation, fetchByParam)
router.put('/:data_download_flayer_produk_id', putValidation, update)
router.delete('/:data_download_flayer_produk_id', softDelete)

module.exports = router
