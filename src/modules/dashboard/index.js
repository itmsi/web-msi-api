const router = require('express').Router()
const {
  fetch, fetchTable
} = require('./handler')

router.get('/', fetch);
router.get('/client', fetchTable);

module.exports = router
