const mongoose = require('mongoose');

const testimonialsSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    message:{
        type:String,
        required:true,
    },
    isPosted:{
        type: Boolean,
        default:false,
        required:true
    },
    
},{
    timestamps:true
})

module.exports = mongoose.model('Testimonials', testimonialsSchema);