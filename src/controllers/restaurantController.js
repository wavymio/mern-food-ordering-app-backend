const Restraunt = require("../models/restaurant")

const getRestaurant = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId
        const restaurant = await Restraunt.findById(restaurantId)

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" })
        }

        res.json(restaurant)  // res.json automatticall appands status code 200
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Something went wrong" })
    }
}

const searchRestaurant = async (req, res) => {
    // we use req.params for the main search which is "city" in this case
    // we use req.query for the filtering parameters like "country, estimatedDeliveryTime, rating, etc"
    
    try {
        const city = req.params.city
        const searchQuery = req.query.searchQuery || ''
        const selectedCuisines = req.query.selectedCuisines || ''
        const sortOption = req.query.sortOption || 'lastUpdated'
        const page = parseInt(req.query.page) || 1

        let query = {}

        query["city"] = new RegExp(city, "i")
        console.log(query)

        const cityCheck = await Restraunt.countDocuments(query)
        if (cityCheck === 0) {
            return res.json({ 
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 1
                }
            })
        }

        if (selectedCuisines) {
            const cuisinesArray = selectedCuisines.split(",").map((cuisine) => new RegExp(cuisine, "i"))
            query["cuisines"] = { $all: cuisinesArray }
        }

        if (searchQuery) {
            const searchRegex = new RegExp(searchQuery, "i")
            query["$or"] = [
                { restaurantName: searchRegex },
                { cuisines: { $in: [searchRegex] } }
            ]
        }

        const pageSize = 10
        const skip = (page - 1) * pageSize

        const restaurants = await Restraunt.find(query).sort({ [sortOption]: 1 }).skip(skip).limit(pageSize).lean()
        
        const total = await Restraunt.countDocuments(query)

        const response = {
            data: restaurants,
            pagination: {
                total,
                page,
                pages: Math.ceil(total/pageSize)
            }
        }

        return res.json(response)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Something went wrong" })
    }
}

module.exports = { searchRestaurant, getRestaurant }