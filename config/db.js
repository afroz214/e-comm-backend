const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        // console.log(process.env.MONGO_URI)
        await mongoose.connect('mongodb+srv://skyler:white@cluster0.bf9yl.mongodb.net/new-e?authSource=admin&replicaSet=atlas-h3ueg2-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true', {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: true,
            useUnifiedTopology: true
        })
        console.log('Connected')
    } catch (error) {
        console.log('Not Connected')
    }
}

module.exports = connectDB

// mongodb+srv://skyler:white@cluster0.bf9yl.mongodb.net/new-e?authSource=admin&replicaSet=atlas-h3ueg2-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true
