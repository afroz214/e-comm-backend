const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const authRoute = require('./routes/user')
const categoryRoute = require('./routes/category')
const subRoute = require('./routes/sub')
const productRoute = require('./routes/product')
const cloudinaryRoute = require('./routes/cloudinary')
const couponRoute = require('./routes/coupon')
const stripeRoute = require('./routes/stripe')

dotenv.config()

connectDB()

const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(morgan('dev'))
app.use(cors())

app.use('/api/auth', authRoute)
app.use('/api', categoryRoute)
app.use('/api', subRoute)
app.use('/api', productRoute)
app.use('/api', cloudinaryRoute)
app.use('/api', couponRoute)
app.use('/api', stripeRoute)

const PORT = process.env.PORT || 8000

app.listen(PORT, console.log(`Server running at ${PORT}`))

