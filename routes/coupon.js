const express = require('express')
const { authCheck } = require('../middleware/auth')
const Coupon = require('../models/coupon')

const router = express.Router()

router.post('/coupon', authCheck, async (req, res) => {
    // console.log(req.body)
    const { name, expiry, discount } = req.body
    console.log(name, expiry, discount)
    try {
        const coupon = new Coupon({ name, expiry, discount })
        // console.log(coupon)
        await coupon.save()
        res.json(coupon)
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.get('/coupon', authCheck, async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 })
        res.json(coupons)
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.delete('/coupon/:couponId', authCheck, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.couponId)
        if (!coupon) {
            return res.status(400).json({ msg: 'No Coupon like this' })
        }
        await coupon.remove()
        res.json(coupon)
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

module.exports = router