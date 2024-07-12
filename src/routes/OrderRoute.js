const express = require('express')
const router = express.Router()
const { jwtCheck, jwtParse } = require('../middleware/auth')
const orderController = require('../controllers/orderController')

router.get('/', jwtCheck, jwtParse, orderController.getMyOrders)

router.post("/checkout/create-checkout-session", jwtCheck, jwtParse, orderController.createCheckoutSession)

router.post("/checkout/webhook", orderController.stripeWebhookHandler)

module.exports = router