const express = require('express')
const { authCheck } = require('../middleware/auth')
const User = require('../models/user')
const Cart = require('../models/cart')
const stripe = require('stripe')('sk_test_51In72jSD6QJL1Hg81gI8mN9zdpFSlWA9Xe7QUmnXS4wXPiZem2oXj7YLsbv3Vyb48mHdkftTxMlxbyRyDLO1CILw00ntQ0Xrp0')

const router = express.Router()

router.post('/create-payment-stripe', authCheck, async (req, res) => {

    const user = await User.findOne({ email: req.user.email })

    const { cartTotal, totalAfterDiscount } = await Cart.findOne({ orderedBy: user._id }) 

    console.log('CartTotal', cartTotal)

    let finalPrice = 0

    if (totalAfterDiscount) {
        finalPrice = totalAfterDiscount * 100
    } else {
        finalPrice = cartTotal * 100
    }

    console.log('Final Price', finalPrice)

    const paymentIntent = await stripe.paymentIntents.create({
        amount: finalPrice,
        currency: 'INR'
    })
    res.send({ clientSecret: paymentIntent.client_secret })
})

module.exports = router