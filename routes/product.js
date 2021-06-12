const express = require('express')
const slugify = require('slugify')
const Product = require('../models/product')
const User = require('../models/user')
const { authCheck } = require('../middleware/auth')

const router = express.Router()

router.post('/product', authCheck, async (req, res) => {
    console.log(req.body)
    req.body.slug = slugify(req.body.title)
    try {
        const product = await Product.create(req.body)
        res.json(product)
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
})

// router.get('/products/:count', async (req, res) => {
//     try {
//         const products = await Product.find({}).limit(parseInt(req.params.count)).populate('category').sort({ createdAt: -1 })
//         res.json(products)
//     } catch (err) {
//         res.status(500).json({ msg: 'Server Error' })
//     }
// })

router.get('/products', async (req, res) => {
    try {
        let {count} = req.query
        count = Number(count)
        const products = await Product.find({}).limit(count)
        res.json(products)
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' })
    }
})
router.get('/all', async (req, res) => {
    try {
        const products = await Product.find({})
        res.json(products)
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.delete('/product/:slug', authCheck, async (req, res) => {
    try {
        const deleted = await Product.findOneAndDelete(req.params.slug)
        res.json(deleted)
    } catch (err) {
        res.status(500).json({ msg: 'Sever Error' })
    }
})

router.get('/product/:slug', async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug }).populate('category').populate('subs')
        res.json(product)
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.put('/product/:slug', authCheck, async (req, res) => {
    req.body.slug = slugify(req.body.title)
    try {
        const updated = await Product.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true })
        res.json(updated)
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.post('/products', async (req, res) => {
    try {
        const { page } = req.body
        console.log(page)
        const currentPage = page || 1
        const perPage = 3
        const products = await Product.find({  }).skip((currentPage - 1) * perPage).populate('category').populate('subs').limit(perPage)
        const totalProducts = await Product.find({})
        res.json({products, totalLength: totalProducts.length})
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})


router.get('/products/pagination/total', async (req, res) => {
    try {
        const products = await Product.find({})
        res.json(products.length) 
    } catch (error) {
        res.status(500).json({ msg: 'Sverve Error' })
    }
})

router.put('/reviews/:productId', authCheck, async (req, res) => {
    const { star } = req.body
    try {
        const product = await Product.findById(req.params.productId)
        const user = await User.findOne({ email: req.user.email })
        const alreadyRating = product.ratings.find(r => r.postedBy.toString() === user._id.toString())
        // console.log(alreadyRating)
        if (alreadyRating) {
            console.log('Updated')
            const ratingUpdated = await Product.updateOne(
                {
                  ratings: { $elemMatch: alreadyRating },
                },
                { $set: { "ratings.$.star": star } },
                { new: true }
              )
              res.json(ratingUpdated)
        } else {
            console.log('Created')
            const addRating = {
                star,
                postedBy: user._id
            }
            product.ratings.push(addRating)
            await product.save()
            res.json(product)
        }
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.get('/product/related/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId)
        const relatedProducts = await Product.find({
            _id: { $ne: product._id }, //neglating the current product
            category: product.category
        }).limit(3)
        // console.log(relatedProducts)
        res.json(relatedProducts)
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

const handleQuery = async (req, res, query) => {
    // const products = await Product.find({ $text: { $search: query } }).populate('category').populate('subs')
    const keyword = query ? {
        title: {
            $regex: query,
            $options: 'i'
        }
    } : {}
    const products = await Product.find({...keyword})
    res.json(products)
}

const handlePrice = async (req, res, price) => {
    const products = await Product.find({ price: { $lte: price, $gte: price - 500 } })
    res.json(products)
}

const handleCategory = async (req, res, category) => {
    console.log(category)
    const products = await Product.find({ category })
    res.json(products)
} 

const handleSub = async (req, res, sub) => {
    const products = await Product.find({ subs: sub })
    res.json(products)
}

const handleBrand = async (req, res, brand) => {
    const products = await Product.find({ brand })
    res.json(products)
}

const handleColor = async (req, res, color) => {
    const products = await Product.find({ color })
    res.json(products)
}
const handleShipping = async (req, res, shipping) => {
    const products = await Product.find({ shipping })
    res.json(products)
}

router.post('/search/filters', async (req, res) => {
    const { query, price, category, sub, brand, color, shipping } = req.body
    if (query) {
        await handleQuery(req, res, query)
    }
    if (price) {
        await handlePrice(req, res, price)
    }
    if (category) {
        await handleCategory(req, res, category)
    }
    if (sub) {
        await handleSub(req, res, sub)
    }
    if (brand) {
        await handleBrand(req, res, brand)
    }
    if (color) {
        await handleColor(req, res, color)
    }
    if (shipping) {
        await handleShipping(req, res, shipping)
    }
})

router.post('/mysearch', async (req, res) => {
    const { query } = req.body
    const keyword = query ? { title: { $regex: query, $options: 'i' } } : {}
    const products = await Product.find(keyword)
    res.json(products)
})

router.post('/myPagination', async (req, res) => {
    const { page } = req.body
    const currentPage = page || 1
    const perPage = 3
    try {
        const products = await Product.find({}).skip((currentPage - 1) * perPage).limit(perPage)
        res.json({count: products.length, products})
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

module.exports = router