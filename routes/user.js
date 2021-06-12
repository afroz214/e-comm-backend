const express = require('express')
const { authCheck } = require('../middleware/auth')
const User = require('../models/user')
const Cart = require('../models/cart')
const Coupon = require('../models/coupon')

const router = express.Router()

router.post('/create-or-update-user', authCheck, async (req, res) => {

    const { name, email, picture } = req.user

    try {
        let user = await User.findOneAndUpdate({ email }, { name, picture }, { new: true })
        if (user) {
            console.log('User Updated')
           return res.json(user)
        } else {
            user = await new User({
                name: email.split('@')[0], email, picture
            })
            await user.save()
            console.log('User Created')
            return res.json(user)
        }
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.get('/current-user', authCheck, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email })
        // console.log(user)
       return res.json(user)
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.post('/cart', authCheck, async (req, res) => {
    try {
    const { cart } = req.body
    const user = await User.findOne({ email: req.user.email })
    let existingCart = await Cart.findOne({ orderedBy: user._id })
    if (existingCart) {
        existingCart.remove()
        console.log('remove Old Cart')
    }
    const updateCart = cart.map(p => {
        return {
            product: p._id,
            count: p.count,
            color: p.color,
            price: p.price
        }
    })
    let cartTotal = cart.reduce((acc, item) => acc + (item.price * item.count), 0)
    console.log(cartTotal)
    let newCart = new Cart({
        products: updateCart,
        cartTotal,
        orderedBy: user._id
    })
    await newCart.save()
    console.log(newCart)
    res.json({ ok: true })
   } catch (err) {
       res.json({ msg: 'Server Error' })
   }

})

router.get('/cart', authCheck, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email })
        let cart = await Cart.findOne({ orderedBy: user._id }).populate("products.product", "_id title price")
        const { products, cartTotal, totalAfterDiscount } = cart 
        res.json({ products, cartTotal, totalAfterDiscount })
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.delete('/cart', authCheck, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email })
        const cart = await Cart.findOne({ orderedBy: user._id })
        await cart.remove()
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.put('/save-address', authCheck, async (req, res) => {
    const { address } = req.body
    try {
        const user = await User.findOne({ email: req.user.email })
        user.address = address
        await user.save()
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.post('/user/coupon', authCheck, async (req, res) => {
    const { coupon } = req.body
    console.log(coupon)
    try {
        const validCoupon = await Coupon.findOne({ name: coupon })
        console.log(validCoupon)
        if (!validCoupon) {
            return res.status(400).json({ msg: 'Invalid Coupon' })
        }
        const user = await User.findOne({ email: req.user.email })

        let cart = await Cart.findOne({ orderedBy: user._id })
        console.log('cartTotalBefore', cart.cartTotal)
        cart.totalAfterDiscount = cart.cartTotal - ((cart.cartTotal * validCoupon.discount) / 100).toFixed(2)
        // console.log(cart.cartTotal)
        console.log('cartTotalAfter', cart.totalAfterDiscount)
        await cart.save()
        res.json({cartTotal: cart.cartTotal, totalAfterDiscount: cart.totalAfterDiscount, discount: validCoupon.discount})
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

module.exports = router