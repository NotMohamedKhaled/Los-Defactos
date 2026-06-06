const mongoose = require('mongoose');

const connectDb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDb connected successfully`);        
    } catch (error) {
        console.log(`cant connect to mongoDb`)
    }
}
module.exports = connectDb