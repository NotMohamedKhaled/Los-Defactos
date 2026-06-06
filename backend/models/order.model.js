const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
        default: 1,
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

  totalPrice: {
    type: Number,
    min: 1,
    required: true,
  },

  shippingName: {
    type: String,
    default: '',
  },
  shippingEmail: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: [String],
    default: [],
  },

  delivery: {
    id: {
      type: String,
      enum: ['option1', 'option2', 'option3'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
  },

  orderStat: {
    type: String,
    enum: [
      'pending',
      'preparing',
      'shipping',
      'recieved',
      'cancelled',
      'rejected by admin',
    ],
    default: 'pending',
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default:false
  },

  orderedAt: {
    type: Date,
    default: Date.now,
  },
},
{
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
