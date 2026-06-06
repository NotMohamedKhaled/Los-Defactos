const mongoose = require('mongoose');

const faqSchema= new mongoose.Schema({
    question: {
        type: String,
        required:true
    },
    answer: {
        type: String,
        required:true
    },
    isPosted:{
        type: Boolean,
        default:false,
        required:true
    },
},
{
    timestamps:true
});

module.exports = mongoose.model('Faq',faqSchema);