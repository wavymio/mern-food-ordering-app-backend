const express = require('express')
const multer = require('multer')
const router = express.Router()
const myRestaurantController = require('../controllers/myRestaurantController')
const { jwtCheck, jwtParse } = require('../middleware/auth')
const { validateMyRestaurantRequest } = require('../middleware/validation')

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 *1024, // 5Mb
    }
})

router.get('/orders', jwtCheck, jwtParse, myRestaurantController.getMyRestaurantOrders)

router.patch('/order/:orderId/status', jwtCheck, jwtParse, myRestaurantController.updateOrderStatus)

router.get('/', jwtCheck, jwtParse, myRestaurantController.getMyRestaurant)

router.post('/', upload.single("imageFile"), validateMyRestaurantRequest, jwtCheck, jwtParse, myRestaurantController.createMyRestaurant)

router.put('/', upload.single("imageFile"), validateMyRestaurantRequest, jwtCheck, jwtParse, myRestaurantController.updateMyRestaurant)

module.exports = router