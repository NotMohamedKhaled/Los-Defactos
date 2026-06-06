require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const SubCategory = require('../models/subCategory.model');
const productsData = require('./products.data');
const {
  buildVariants,
  syncProductComputedFields,
  resolveVariantsForSave,
} = require('../utils/productStock');

const slugify = (title) =>
  String(title)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

async function connectDb() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing from .env');
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
}

async function resolveRef(value, model, field = 'name') {
  if (!value) return null;
  if (mongoose.isValidObjectId(value)) return value;

  const doc = await model.findOne({
    [field]: { $regex: new RegExp(`^${String(value).trim()}$`, 'i') },
    isDeleted: { $ne: true },
  });

  if (!doc) {
    console.warn(`  ⚠ Could not find ${model.modelName} "${value}" — leaving unset`);
    return null;
  }

  return doc._id;
}

function buildProductVariants(entry, slug) {
  if (entry.variants?.length) {
    return resolveVariantsForSave({
      variantsPayload: entry.variants,
      baseSlug: slug,
    });
  }

  if (entry.colors || entry.sizes) {
    const combos = buildVariants(entry.colors, entry.sizes, [], slug);
    const stock = Math.max(0, Number(entry.defaultStock) || 0);
    return combos.map((variant) => ({ ...variant, stock }));
  }

  throw new Error('Each product needs "variants" or "colors"/"sizes"');
}

async function seedProducts({ fresh = false } = {}) {
  if (fresh) {
    const deleted = await Product.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing product(s)`);
  }

  let created = 0;
  let skipped = 0;

  for (const entry of productsData) {
    const slug = entry.slug || slugify(entry.title);

    const exists = await Product.findOne({ slug });
    if (exists) {
      console.log(`Skip (slug exists): ${slug}`);
      skipped++;
      continue;
    }

    const category = await resolveRef(entry.category, Category);
    const subCategory = await resolveRef(entry.subCategory, SubCategory);
    const variants = buildProductVariants(entry, slug);

    const productDoc = {
      title: entry.title,
      desc: entry.desc,
      slug,
      price: Number(entry.price),
      imgUrl: entry.imgUrl,
      category,
      subCategory,
      tags: entry.tags || [],
      keywords: entry.keywords || [],
      specs: entry.specs || [],
      variants,
      isDeleted: false,
    };

    syncProductComputedFields(productDoc);

    await Product.create(productDoc);
    console.log(`Created: ${entry.title} (${slug})`);
    created++;
  }

  console.log(`\nDone — created: ${created}, skipped: ${skipped}`);
}

async function run() {
  const fresh = process.argv.includes('--fresh');

  try {
    await connectDb();
    await seedProducts({ fresh });
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

run();
