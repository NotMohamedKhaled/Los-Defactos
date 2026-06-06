const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, 
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      price: {
        type: Number,
        required: true,
        min: 1,
      },
      quantity: {
        type: Number,
        required: true,
        default:1,
        min: 1,
      },
      color: {
        type: String,
        default: ""
      },
      size: {
        type: String,
        default: ""
      }
    },
  ],
  addedToCartAt: {
    type:Date,
    default:Date.now()
  },

 delivery: {
      id: {
        type: String,
        enum: ["option1", "option2", "option3"],
        default: null, // optional now
      },
      date: {
        type: Date,
        default: null, // optional now
      },
      fee: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
},
{
    timestamps:true
});
cartSchema.pre("save", function (next) {
  if (!this.delivery.id) {
    this.delivery = { id: null, date: null, fee: 0 };
  }
  next();
});
module.exports = mongoose.model('Cart',cartSchema);
