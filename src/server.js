const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')

mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING)
    .then(() => {
        console.log("Connected to database")
    })

const app = express()

// routes 
const myUserRoute = require('./routes/myUserRoute')

// middleware
app.use(express.json())
app.use(cors())

// api calls
app.get('/health', async (req, res) => {
    res.send({ message: "Health Okay!" })
})

app.use('/api/my/user', myUserRoute)

app.listen(8080, () => {
    console.log("Server started on localhost:8080")
})