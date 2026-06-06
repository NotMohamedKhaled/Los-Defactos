const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    color: { type: String, default: '', trim: true },
    size: { type: String, default: '', trim: true },
    stock: { type: Number, min: 0, default: 0 },
    sku: { type: String, required: true, trim: true },
    price: { type: Number, min: 0 },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    price: {
      type: Number,
      min: 1,
      required: true,
    },
    isInStock: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isAboutToBeOut: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
    tags: [{ type: String }],
    variants: {
      type: [variantSchema],
      validate: {
        validator: function (variants) {
          if (!variants || variants.length === 0) return false;
          const keys = variants.map((v) => `${v.color || ''}::${v.size || ''}`);
          return keys.length === new Set(keys).size;
        },
        message: 'Duplicate variant combinations (same color and size) are not allowed',
      },
    },
    specs: [{ type: String }],
    keywords: [{ type: String }],
    imgUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
