const { Router } = require('express');
const banks = require('../banks/handler');
const colors = require('../colors/handler');

const router = Router();

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/

// option endpoint
router.get('/option/banks', banks.fetchPublic);
router.get('/option/colors', colors.fetchPublic);

module.exports = router;
