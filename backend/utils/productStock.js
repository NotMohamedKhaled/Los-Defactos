const variantKey = (color = '', size = '') => `${color}::${size}`;

const parseList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

const slugifyPart = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') || 'default';

const generateSku = (baseSlug, color = '', size = '') => {
  const parts = [baseSlug || 'product', slugifyPart(color), slugifyPart(size)].filter(Boolean);
  return parts.join('-').toUpperCase();
};

const normalizeVariant = (entry, baseSlug = 'product') => {
  const color = (entry.color || '').trim();
  const size = (entry.size || '').trim();
  const stock = Math.max(0, Number(entry.stock) || 0);
  const sku = (entry.sku || '').trim() || generateSku(baseSlug, color, size);
  const normalized = { color, size, stock, sku };

  if (entry.price !== undefined && entry.price !== null && entry.price !== '') {
    const price = Number(entry.price);
    if (!Number.isNaN(price) && price >= 0) {
      normalized.price = price;
    }
  }

  return normalized;
};

const validateVariants = (variants) => {
  if (!variants || variants.length === 0) {
    throw new Error('At least one product variant is required');
  }

  const keys = variants.map((v) => variantKey(v.color, v.size));
  if (keys.length !== new Set(keys).size) {
    throw new Error('Duplicate variant combinations (same color and size) are not allowed');
  }

  const skus = variants.map((v) => v.sku);
  if (skus.length !== new Set(skus).size) {
    throw new Error('Duplicate variant SKUs are not allowed');
  }
};

const buildVariantCombinations = (colors, sizes) => {
  const colorList = parseList(colors);
  const sizeList = parseList(sizes);

  if (colorList.length && sizeList.length) {
    return colorList.flatMap((color) => sizeList.map((size) => ({ color, size })));
  }

  if (colorList.length) {
    return colorList.map((color) => ({ color, size: '' }));
  }

  if (sizeList.length) {
    return sizeList.map((size) => ({ color: '', size }));
  }

  return [{ color: '', size: '' }];
};

const buildVariants = (colors, sizes, variantInputs = [], baseSlug = 'product') => {
  const inputMap = new Map();

  (variantInputs || []).forEach((entry) => {
    const normalized = normalizeVariant(entry, baseSlug);
    inputMap.set(variantKey(normalized.color, normalized.size), normalized);
  });

  const combinations = variantInputs?.length
    ? variantInputs.map((entry) => normalizeVariant(entry, baseSlug))
    : buildVariantCombinations(colors, sizes).map(({ color, size }) => {
        const key = variantKey(color, size);
        if (inputMap.has(key)) return inputMap.get(key);
        return normalizeVariant({ color, size, stock: 0 }, baseSlug);
      });

  validateVariants(combinations);
  return combinations;
};

const migrateLegacyProduct = (product) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants.map((v) => normalizeVariant(v, product.slug));
  }

  const baseSlug = product.slug || 'product';
  const legacyColors = product.colors || [];
  const legacySizes = product.sizes || [];
  const legacyStock = Math.max(0, Number(product.stock) || 0);

  if (legacyColors.length && legacySizes.length) {
    return legacyColors.flatMap((color) =>
      legacySizes.map((size) =>
        normalizeVariant({ color, size, stock: 0 }, baseSlug)
      )
    );
  }

  if (legacyColors.length) {
    return legacyColors.map((color) =>
      normalizeVariant({ color, size: '', stock: 0 }, baseSlug)
    );
  }

  if (legacySizes.length) {
    return legacySizes.map((size) =>
      normalizeVariant({ color: '', size, stock: 0 }, baseSlug)
    );
  }

  return [normalizeVariant({ color: '', size: '', stock: legacyStock }, baseSlug)];
};

const ensureVariants = (product) => {
  if (!product) return [];
  return migrateLegacyProduct(product);
};

const ensureVariantsOnProduct = (product) => {
  if (!product.variants || product.variants.length === 0) {
    product.variants = migrateLegacyProduct(product);
  }
  return product.variants;
};

const deriveColors = (variants) =>
  [...new Set(variants.map((v) => v.color).filter(Boolean))];

const deriveSizes = (variants) =>
  [...new Set(variants.map((v) => v.size).filter(Boolean))];

const getTotalStock = (variants) =>
  variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

const getIsInStock = (variants) => getTotalStock(variants) > 0;

const getIsAboutToBeOut = (variants) => {
  const total = getTotalStock(variants);
  return total > 0 && total <= 5;
};

const syncProductComputedFields = (product) => {
  const variants = ensureVariants(product);
  product.variants = variants;
  product.isInStock = getIsInStock(variants);
  product.isAboutToBeOut = getIsAboutToBeOut(variants);
  return product;
};

const normalizeProductResponse = (product) => {
  if (!product) return product;

  const doc = product.toObject ? product.toObject({ virtuals: true }) : { ...product };
  const variants = ensureVariants(doc);

  doc.variants = variants;
  doc.colors = deriveColors(variants);
  doc.sizes = deriveSizes(variants);
  doc.stock = getTotalStock(variants);
  doc.isInStock = getIsInStock(variants);
  doc.isAboutToBeOut = getIsAboutToBeOut(variants);

  delete doc.__v;
  return doc;
};

const findVariant = (product, color = '', size = '') => {
  const normalizedColor = color || '';
  const normalizedSize = size || '';
  const variants = ensureVariants(product);

  return variants.find(
    (v) => v.color === normalizedColor && v.size === normalizedSize
  );
};

const findVariantOnProduct = (product, color = '', size = '') => {
  const variants = ensureVariantsOnProduct(product);
  const normalizedColor = color || '';
  const normalizedSize = size || '';

  return variants.find(
    (v) => (v.color || '') === normalizedColor && (v.size || '') === normalizedSize
  );
};

const deductVariantStock = (product, color, size, quantity) => {
  ensureVariantsOnProduct(product);
  const variant = findVariantOnProduct(product, color, size);

  if (!variant || variant.stock < quantity) {
    return { ok: false, variant, available: variant ? variant.stock : 0 };
  }

  variant.stock -= quantity;
  syncProductComputedFields(product);
  return { ok: true, variant, available: variant.stock };
};

const parseVariantsPayload = (variantsPayload) => {
  if (!variantsPayload) return [];

  if (Array.isArray(variantsPayload)) {
    return variantsPayload;
  }

  try {
    const parsed = JSON.parse(variantsPayload);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const resolveVariantsForSave = ({ variantsPayload, colors, sizes, baseSlug }) => {
  const parsed = parseVariantsPayload(variantsPayload);

  if (parsed.length > 0) {
    return buildVariants(null, null, parsed, baseSlug);
  }

  return buildVariants(colors, sizes, [], baseSlug);
};

const buildStockAggregationStages = (stockFilter) => {
  if (!stockFilter || typeof stockFilter !== 'object') return [];

  return [
    {
      $addFields: {
        stock: { $sum: '$variants.stock' },
      },
    },
    { $match: { stock: stockFilter } },
  ];
};

module.exports = {
  variantKey,
  parseList,
  generateSku,
  normalizeVariant,
  validateVariants,
  buildVariants,
  migrateLegacyProduct,
  ensureVariants,
  ensureVariantsOnProduct,
  deriveColors,
  deriveSizes,
  getTotalStock,
  getIsInStock,
  getIsAboutToBeOut,
  syncProductComputedFields,
  normalizeProductResponse,
  findVariant,
  findVariantOnProduct,
  deductVariantStock,
  parseVariantsPayload,
  resolveVariantsForSave,
  buildStockAggregationStages,
};
