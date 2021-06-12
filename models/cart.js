const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const cartSchema = mongoose.Schema({
    products: [{
        product: {
            type: ObjectId,
            ref: 'Product'
        },
        count: {
            type: Number
        },
        color: {
            type: String
        },
        price: {
            type: Number
        }
    }],
    cartTotal: Number,
    totalAfterDiscount: Number,
    orderedBy: {
        type: ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

module.exports = mongoose.model('Cart', cartSchema)