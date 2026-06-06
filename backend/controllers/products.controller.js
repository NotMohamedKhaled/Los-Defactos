const Product = require('../models/product.model');
const Category = require('../models/category.model');
const mongoose = require('mongoose');
const {
  parseList,
  resolveVariantsForSave,
  syncProductComputedFields,
  normalizeProductResponse,
  buildStockAggregationStages,
  ensureVariants,
  deriveColors,
  deriveSizes,
  buildVariants,
  normalizeVariant,
} = require('../utils/productStock');
const { getUploadedImageUrl } = require('../middlewares/upload.middleware');

exports.addProduct = async (req, res) => {
  try {
    const { title, desc, price, keywords, category, subCategory, tags, colors, sizes, specs, variants } = req.body;

    const priceNum = Number(price);
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const imgUrl = getUploadedImageUrl(req.file);

    const notValidSlug = await Product.findOne({ slug });
    if (notValidSlug) {
      return res.status(400).json({ message: 'Product was not added, That product already exists' });
    }

    const builtVariants = resolveVariantsForSave({
      variantsPayload: variants,
      colors,
      sizes,
      baseSlug: slug,
    });

    const productData = {
      title,
      desc,
      slug,
      price: priceNum,
      imgUrl,
      keywords: parseList(keywords),
      tags: parseList(tags),
      specs: parseList(specs),
      variants: builtVariants,
      category,
      subCategory,
    };

    syncProductComputedFields(productData);

    const product = await Product.create(productData);

    return res.status(201).json({
      message: 'Product added successfully',
      data: normalizeProductResponse(product),
    });
  } catch (error) {
    console.error('Add Product Error:', error);
    return res.status(400).json({ message: `Product was not added, ERROR: ${error.message}` });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const baseFilter = { isDeleted: false };
    const filters = Object.assign({}, baseFilter, req.filters || {});

    if (req.query.keywords) {
      const search = req.query.keywords;
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } },
      ];
      delete filters.keywords;
    }

    if (filters.category && typeof filters.category === 'string' && !mongoose.isValidObjectId(filters.category)) {
      const categoryObj = await Category.findOne({
        name: { $regex: new RegExp(`^${filters.category}$`, 'i') },
        isDeleted: false,
      });
      filters.category = categoryObj ? categoryObj._id : null;
    }

    const stockFilter = filters.stock;
    delete filters.stock;

    const sortParam = req.query.sort;
    const sortFields = sortParam ? sortParam.split(',').join(' ') : '-createdAt';
    const { limit = 10, skip = 0, page = 1 } = req.pagination || {};

    let data;
    let total;

    if (stockFilter) {
      const sortObj = (sortFields.split(' ') || ['-createdAt']).reduce((acc, field) => {
        const desc = field.startsWith('-');
        acc[desc ? field.slice(1) : field] = desc ? -1 : 1;
        return acc;
      }, {});

      const pipeline = [
        { $match: filters },
        ...buildStockAggregationStages(stockFilter),
        { $sort: sortObj },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: 'count' }],
          },
        },
      ];

      const result = await Product.aggregate(pipeline);
      const aggregateData = result[0]?.data || [];
      total = result[0]?.total[0]?.count || 0;

      const ids = aggregateData.map((item) => item._id);
      const populated = await Product.find({ _id: { $in: ids } })
        .populate('category', 'name')
        .populate('subCategory', 'name');

      const populatedMap = new Map(populated.map((p) => [p._id.toString(), p]));
      data = ids.map((id) => populatedMap.get(id.toString())).filter(Boolean);
    } else {
      [total, data] = await Promise.all([
        Product.countDocuments(filters),
        Product.find(filters)
          .populate('category', 'name')
          .populate('subCategory', 'name')
          .sort(sortFields)
          .skip(skip)
          .limit(limit),
      ]);
    }

    return res.status(200).json({
      message: 'Product list',
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: data.map(normalizeProductResponse),
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    if (!slug) return res.status(404).json({ message: 'product not found' });

    const product = await Product.findOne({ slug, isDeleted: false })
      .populate('category', 'name')
      .populate('subCategory', 'name');

    if (!product) return res.status(404).json({ message: 'product not found' });

    return res.status(200).json({
      message: 'Product found',
      data: normalizeProductResponse(product),
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: 'Product id not found' });

    const {
      title,
      desc,
      slug,
      price,
      keywords,
      category,
      subCategory,
      isDeleted,
      tags,
      colors,
      sizes,
      specs,
      variants,
    } = req.body;

    const imgUrl = getUploadedImageUrl(req.file) || prod.imgUrl;
    const priceNum = price !== undefined ? Number(price) : prod.price;
    const nextSlug = slug || prod.slug;

    if (slug && slug !== prod.slug) {
      const slugTaken = await Product.findOne({ slug });
      if (slugTaken) {
        return res.status(400).json({ message: 'Product was not updated, That slug already exists' });
      }
    }

    let builtVariants = resolveVariantsForSave({
      variantsPayload: variants,
      colors,
      sizes,
      baseSlug: nextSlug,
    });

    if (variants === undefined && colors === undefined && sizes === undefined) {
      const existing = ensureVariants(prod).map((v) =>
        normalizeVariant(v, nextSlug)
      );
      builtVariants = existing;
    } else if (variants === undefined && (colors !== undefined || sizes !== undefined)) {
      const existing = ensureVariants(prod);
      builtVariants = buildVariants(
        colors !== undefined ? colors : deriveColors(existing).join(','),
        sizes !== undefined ? sizes : deriveSizes(existing).join(','),
        existing,
        nextSlug
      );
    }

    const update = {
      title,
      desc,
      slug: nextSlug,
      price: priceNum,
      imgUrl,
      category: category || null,
      subCategory: subCategory || null,
      variants: builtVariants,
    };

    if (keywords !== undefined) update.keywords = parseList(keywords);
    if (tags !== undefined) update.tags = parseList(tags);
    if (specs !== undefined) update.specs = parseList(specs);

    syncProductComputedFields(update);

    if (typeof isDeleted === 'boolean') {
      update.isDeleted = isDeleted;
    }

    const newProduct = await Product.findByIdAndUpdate(id, update, { new: true });

    const message =
      typeof isDeleted === 'boolean'
        ? isDeleted
          ? 'product deleted successfully'
          : 'product restored successfully'
        : 'product updated successfully';

    return res.status(201).json({
      message,
      data: normalizeProductResponse(newProduct),
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: 'Product id not found' });

    const deletedProd = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    return res.status(200).json({
      message: 'product deleted successfully',
      data: normalizeProductResponse(deletedProd),
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');

    const { paginationMeta } = require('../middlewares/pagination.middleware');
    const sort = { createdAt: -1 };

    if (!req.pagination) {
      const products = await Product.find().sort(sort);
      return res.status(200).json({
        message: 'All products fetched successfully',
        data: products.map(normalizeProductResponse),
      });
    }

    const { page, limit, skip } = req.pagination;
    const [total, products] = await Promise.all([
      Product.countDocuments(),
      Product.find().sort(sort).skip(skip).limit(limit),
    ]);

    return res.status(200).json({
      message: 'Products fetched successfully',
      data: products.map(normalizeProductResponse),
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    return res.status(500).json({ message: 'Failed to fetch products' });
  }
};

exports.restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isDeleted) {
      return res.status(400).json({ message: 'Product is already active' });
    }

    product.isDeleted = false;
    await product.save();

    return res.status(200).json({
      message: 'Product restored successfully',
      data: normalizeProductResponse(product),
    });
  } catch (error) {
    console.error('Restore Product Error:', error);
    return res.status(500).json({
      message: `Failed to restore product: ${error.message}`,
    });
  }
};
