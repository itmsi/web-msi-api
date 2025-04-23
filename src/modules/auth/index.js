const { Router } = require('express')
const {
  signin, refreshToken, me, customerSignin, conductorSignin, refreshTokenCustomer, meCustomer,
  clientSignin, meClient, refreshTokenClient, signinInspection
} = require('./handler')
const { siginValidation, siginCustomerValidation, siginConductorValidation } = require('./validation')
const {
  verifyToken, verifyTokenCustomer, verifyTokenClient, validateRecaptcha, adminSigninLimiter, conductorSigninLimiter, customerSigninLimiter, clientSigninLimiter,
} = require('../../middlewares')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/signin', adminSigninLimiter, siginValidation, signin)
router.post('/inspection/signin', siginValidation, signinInspection)
router.post('/conductor/signin', conductorSigninLimiter, siginConductorValidation, conductorSignin)
router.get('/refresh-token', verifyToken, refreshToken)
router.get('/me', verifyToken, me)
router.get('/customer/refresh-token', verifyTokenCustomer, refreshTokenCustomer)
// router.post('/customer/signin', customerSigninLimiter, siginCustomerValidation, customerSignin)
router.post('/customer/signin', customerSigninLimiter, siginCustomerValidation, validateRecaptcha, customerSignin)
router.get('/customer/me', verifyTokenCustomer, meCustomer)
router.get('/client/refresh-token', verifyTokenClient, refreshTokenClient)
router.post('/client/signin', clientSigninLimiter, siginCustomerValidation, validateRecaptcha, clientSignin)
// router.post('/client/signin', clientSigninLimiter, siginCustomerValidation, clientSignin)
router.get('/client/me', verifyTokenClient, meClient)

module.exports = router
