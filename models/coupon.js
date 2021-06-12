const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        uppercase: true,
        minlength: [5, 'Too short'],
        maxlength: [10, 'Too long']
    },
    expiry: {
        type: Date,
        required: true
    },
    discount: {
        type: Number,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Coupon', couponSchema)