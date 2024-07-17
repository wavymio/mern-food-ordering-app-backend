const { default: mongoose } = require("mongoose")
const Restraunt = require("../models/restaurant")
const Order = require("../models/order")
const { v2: cloudinary } = require('cloudinary')

const getMyRestaurant = async (req, res) => {
    try {
        const restaurant = await Restraunt.findOne({ user: req.userId })

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not find" })
        }

        res.json(restaurant)
    } catch (err) {
        console.log("error: ", err)
        res.status(500).json({ message: "Error fetching restaurant" })
    }
}

const createMyRestaurant = async (req, res) => {
    try {
        const existingRestaurant  = await Restraunt.findOne({ user: req.userId })

        if(existingRestaurant) {
            return res.status(409).json({ message: "User restaurant already exists" })
        }

        const imageUrl = await uploadImage(req.file)

        const restaurant = new Restraunt(req.body)
        restaurant.imageUrl = imageUrl
        restaurant.user = new mongoose.Types.ObjectId(req.userId)
        restaurant.lastUpdated = new Date()

        await restaurant.save()
        res.status(201).send(restaurant)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Something went wrong" })
    }
}

const updateMyRestaurant = async (req, res) => {
    try {
        const restaurant = await Restraunt.findOne({ user: req.userId })
        
        if (!restaurant) {
            return res.status(404).json({ message: "Reataurant not found" })
        }

        restaurant.restaurantName = req.body.restaurantName
        restaurant.city = req.body.city
        restaurant.country = req.body.country
        restaurant.deliveryPrice = req.body.deliveryPrice
        restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime
        restaurant.cuisines = req.body.cuisines
        restaurant.menuItems = req.body.menuItems
        restaurant.lastUpdated = new Date()

        if (req.file) {
            const imageUrl = await uploadImage(req.file)
            restaurant.imageUrl = imageUrl
        }

        await restaurant.save()
        res.status(200).send(restaurant)

    } catch (err) {
        console.log("error: ", err)
        res.status(500).json({message: "Something went wrong"})
    }
}

const getMyRestaurantOrders = async (req, res) => {
    try {
        const restaurant = await Restraunt.findOne({ user: req.userId })
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" })
        }

        const orders = await Order.find({ restaurant: restaurant._id }).populate("restaurant").populate("user")
        res.json(orders)
    } catch (err) {
        console.log(err)
        res.json(500).json({ message: "Something went wrong" })
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status } = req.body

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        const restaurant = await Restraunt.findById(order.restaurant)

        if (restaurant?.user?._id.toString() !== req.userId) {
            return res.status(401).send()
        }

        order.status = status
        await order.save()

        res.status(200).json(order)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Unable to update order status" })
    }
}

const uploadImage = async (file) => {
    const image = file
    const base64Image = Buffer.from(image.buffer).toString("base64")
    const dataURI = `data:${image.mimetype};base64,${base64Image}`

    const uploadResponse = await cloudinary.uploader.upload(dataURI)
    return uploadResponse.url
}

module.exports = { getMyRestaurant, createMyRestaurant, updateMyRestaurant, getMyRestaurantOrders, updateOrderStatus }