const admin = require('../firebase/index')

exports.authCheck = async (req, res, next) => {
    const { token } = req.headers
    try {
        const firebaseUser = await admin.auth().verifyIdToken(token)
        // console.log(firebaseUser)
        req.user = firebaseUser 
        next()
        // console.log('next')
    } catch (err) {
        res.status(500).json({ err: 'invalid token' })   
    }
}