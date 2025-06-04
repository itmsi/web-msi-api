const { Router } = require('express')
const {
  store
} = require('./handler')
const { postValidation } = require('./validation')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', postValidation, store)

module.exports = router
