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
router.get('/:member_voucher_id', paramValidation, fetchByParam)
router.put('/:member_voucher_id', putValidation, update)
router.delete('/:member_voucher_id', softDelete)

module.exports = router
