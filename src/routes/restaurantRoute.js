const express = require('express')
const router = express.Router()
const { param } = require('express-validator')
const restaurantController = require('../controllers/restaurantController')

router.get("/search/:city", param("city").isString().trim().notEmpty().withMessage("City parameter must be a valid string"), restaurantController.searchRestaurant)

module.exports = router