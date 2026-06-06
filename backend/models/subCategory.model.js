const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Category'
  },
  description:String,
  isDeleted: {
    type: Boolean,
    default: false
  }
},
{
    timestamps:true
});

module.exports = mongoose.model('SubCategory',subCategorySchema);