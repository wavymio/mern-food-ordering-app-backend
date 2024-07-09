const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
const {v2: cloudinary} = require('cloudinary')
const multer = require('multer')

mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING)
    .then(() => {
        console.log("Connected to database")
    })

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express()

// routes 
const myUserRoute = require('./routes/myUserRoute')
const myRestaurantRoute = require('./routes/myRestaurantRoute')
const restaurantRoute = require('./routes/restaurantRoute')
const orderRoute = require('./routes/OrderRoute')

// middleware
app.use(cors())
app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }))
app.use(express.json())

// api calls
app.get('/health', async (req, res) => {
    res.send({ message: "Health Okay!" })
})

app.use('/api/my/user', myUserRoute)
app.use('/api/my/restaurant', myRestaurantRoute)
app.use('/api/restaurant', restaurantRoute)
app.use('/api/order', orderRoute)

app.listen(8080, () => {
    console.log("Server started on localhost:8080")
})