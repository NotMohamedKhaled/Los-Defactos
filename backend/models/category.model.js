const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  desc:{
    type:String,
    required:true,
  },
  imgUrl: String,
  
  isDeleted:{
    type:Boolean,
    default:false,
  }
},
{
    timestamps:true
});

module.exports = mongoose.model('Category',categorySchema);