const express = require('express')
const { authCheck } = require('../middleware/auth')
const { cloudinary } = require('../config/cloudinary')

const router = express.Router()


router.post('/uploadimage', authCheck, async (req, res) => {
    console.log(req.body.image)
    try {
        console.log('Back')
        let result = await cloudinary.uploader.upload(req.body.image, {
            upload_preset: 'myfiles'
        })
        console.log('Back 2')
        console.log(result)
        res.json({ msg: 'Ok' })
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

router.delete('/removeimage', authCheck, async (req, res) => {
    try {
        const image_id = req.body.public_id
        cloudinary.uploader.destroy(image_id, (err, result) => {
            if (err) {
                return res.json({ success: false, err })
            }
            res.json({ msg: 'image deleted successfully' })
        })
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' })
    }
})

module.exports = router

