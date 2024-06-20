const { body, validationResult } = require('express-validator')

const handleValidationErrors = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    next()
}

const validateMyUserRequest = [
    body("name").isString().notEmpty().withMessage("Name must be a string"),
    body("addressLine1").isString().notEmpty().withMessage("AddressLine1 must be a string"),
    body("city").isString().notEmpty().withMessage("city must be a string"),
    body("country").isString().notEmpty().withMessage("country must be a string"),
    handleValidationErrors,
]

const validateMyRestaurantRequest = [
    body("restaurantName").notEmpty().withMessage("Restaurant name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("deliveryPrice").isFloat({ min: 0 }).withMessage("Delivery price must be a positive number"),
    body("estimatedDeliveryTime").isInt({min: 0}).withMessage("Estimated delivery time must be a positive integer"),
    body("cuisines").isArray().withMessage("Cusines must be an array").not().isEmpty().withMessage("Cusines array must not be empty"),
    body("menuItems").isArray().withMessage("Menu Items must be an array"),
    body("menuItems.*.name").notEmpty().withMessage("Menu item name is required"),
    body("menuItems.*.price").isFloat({ min: 0 }).withMessage("Menu item price is required and must be a positive number"),
    handleValidationErrors
]


module.exports = {
    validateMyUserRequest,
    validateMyRestaurantRequest
}