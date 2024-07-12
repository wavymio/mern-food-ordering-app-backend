const Stripe = require('stripe')
const Restaurant = require('../models/restaurant')
const Order = require('../models/order')

const STRIPE = new Stripe(process.env.STRIPE_API_KEY)
const FRONTEND_URL = process.env.FRONTEND_URL
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
        .populate("restaurant")
        .populate("user")
        res.json(orders)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Something went wrong" })
    }
}

const stripeWebhookHandler = async (req, res) => {
    let event

    try {
        const sig = req.headers["stripe-signature"]
        event = STRIPE.webhooks.constructEvent(req.body, sig, STRIPE_ENDPOINT_SECRET)
    } catch (err) {
        console.log(err)
         return res.status(400).send(`Webhook error: ${err.message}`)
    }

    if (event.type === "checkout.session.completed") {
        const order = await Order.findById(event.data.object.metadata?.orderId)       
    
        if (!order) {
            return res.status(404).json({ message: "Order not found." })
        }

        order.totalAmount = event.data.object.amount_total/100
        order.status = "paid"

        await order.save()
    }

    res.status(200).send()
}


const createCheckoutSession = async (req, res) => {
    try {
        const checkoutSessionRequest = req.body

        const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId)
        if (!restaurant) {
            throw Error("Restaurant not found")
        }

        const newOrder = new Order({
            restaurant: restaurant,
            user: req.userId,
            status: "placed",
            deliveryDetails: checkoutSessionRequest.deliveryDetails,
            cartItems: checkoutSessionRequest.cartItems,
            createdAt: new Date()
        })

        const lineItems = createLineItems(checkoutSessionRequest, restaurant.menuItems)
    
        const session = await createSession(lineItems, newOrder._id.toString(), restaurant.deliveryPrice, restaurant._id.toString())
        if (!session.url) {
            return res.status(500).json({ message: "Error creating stripe session" })
        }

        await newOrder.save()
        res.json({ url: session.url })

    } catch (err) {
        console.log(err)
        // err.raw gives a very descriptive message
        res.status(500).json({ message: err.raw.message })
    }
}

const createLineItems = (checkoutSessionRequest, menuItems) => {
    // since we didn't pass the price through the frontend for safety reasons, we have to iterate through the menuItems and backend menu items to return the price stored in the database
    // Dude if you don't understand this shit then you've gotten dumber

    const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
        const menuItem = menuItems.find((item) => item._id.toString() === cartItem.menuItemId.toString())
        
        if (!menuItem) {
            throw new Error(`Menu item not found: ${cartItem.menuItemId}`)
        }

        const line_item = {
            price_data: {
                currency: "usd",
                unit_amount: menuItem.price,
                product_data: {
                    name: menuItem.name
                },
            },
            quantity: parseInt(cartItem.quantity)
        }

        return line_item
    })

    return lineItems
}

const createSession = async (lineItems, orderId, deliveryPrice, restaurantId) => {
    const sessionData = await STRIPE.checkout.sessions.create({
        line_items: lineItems,
        shipping_options: [
            {
                shipping_rate_data: {
                    display_name: "Delivery",
                    type: "fixed_amount",
                    fixed_amount: {
                        amount: deliveryPrice,
                        currency: "usd"
                    }
                }
            }
        ],
        mode: "payment",
        metadata: {      // METADATA saves info that we might need later
            orderId: orderId,   //In this case we're saving orderId and restaurantId
            restaurantId: restaurantId  // because we might need them later
        },
        success_url: `${FRONTEND_URL}/order-status?success=true`,
        cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`
    })

    return sessionData
}

module.exports = {
    getMyOrders,
    createCheckoutSession,
    stripeWebhookHandler
}