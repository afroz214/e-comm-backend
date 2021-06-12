const express = require('express')
const { authCheck } = require('../middleware/auth')
const Sub = require('../models/sub')
const slugify = require('slugify')
const Product = require('../models/product')

const router = express.Router()

router.post('/sub', authCheck, async (req, res) => {
    const { name, parent } = req.body
    try {
        console.log(name, parent)
        if (parent.includes('Please Select')) {
            return res.status(400).json({ msg: 'Please select a category' })
        }
        const duplicateSub = await Sub.findOne({ name })
        if (!duplicateSub) {
            const sub = await new Sub({
                name, slug: slugify(name), parent
            })
            await sub.save()
            res.json(sub)
        } else {
            res.status(400).json({ msg: 'Try another name' })
        }
    } catch (err) {
        res.status(500).json({ msg: 'Server Erro' })
    }
})

router.get('/subs', async (req, res) => {
    try {
        const subs = await Sub.find({}).sort({createdAt: -1})
        res.json(subs)
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.get('/sub/:slug', async (req, res) => {
    try {
        const sub = await Sub.findOne({ slug: req.params.slug })
        console.log(sub)
        const products = await Product.find({ subs: sub })
        res.json({sub, products})
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.delete('/sub/:slug', authCheck, async (req, res) => {
    try {
        const sub = await Sub.findOneAndDelete({ slug: req.params.slug })
        res.json(sub)
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.put('/sub/:slug', authCheck, async (req, res) => {
    const { name, parent } = req.body
    try {
        const sub = await Sub.findOneAndUpdate({slug: req.params.slug}, { name, parent, slug: slugify(name) }, { new: true })
        res.json(sub)
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

module.exports = router