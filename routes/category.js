const express = require('express')
const Category = require('../models/category.js')
const Product = require('../models/product.js')
const { authCheck } = require('../middleware/auth')
const slugify = require('slugify')
const Sub = require('../models/sub')

const router = express.Router()

router.post('/category', authCheck, async (req, res) => {
    const { name } = req.body
    
    try {
        console.log(name)
        const duplicateName = await Category.findOne({name})
        if (!duplicateName) {
            const category = new Category({
                name, slug: slugify(name)
            })
            await category.save()
            res.json(category)
        } else {
            res.status(400).json({ msg: 'name already exist' })
        }
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 })
        res.json(categories)
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.get('/category/:slug', async (req, res) => {
    try {
        const category = await Category.findOne({slug: req.params.slug})
        const products = await Product.find({ category: category._id })
        res.json({ category, products })
        // res.json(category)
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.delete('/category/:slug', async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({slug: req.params.slug})
        res.json(category)
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.put('/category/:slug', authCheck, async (req, res) => {
    try {
        const { name } = req.body
        const category = await Category.findOne({ slug: req.params.slug })
        category.name = name
        category.slug = slugify(name)
        await category.save()
        // const category = await Category.findOneAndUpdate({slug: req.params.slug}, {name, slug: slugify(name)}, { new: true })
        res.json(category)
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.get('/category/subs/:id', async (req, res) => {
    try {
        const subs = await Sub.find({parent: req.params.id})
        res.json(subs)
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
})

module.exports = router

