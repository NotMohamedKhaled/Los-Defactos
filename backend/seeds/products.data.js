/**
 * Edit this file with the products you want to seed.
 *
 * Required fields per product:
 *   title, desc, price, imgUrl, variants (at least one)
 *
 * Category / subCategory can be:
 *   - A name string (looked up in DB), e.g. category: 'Men'
 *   - A MongoDB ObjectId string, e.g. category: '674a1b2c3d4e5f6789012345'
 *   - null / omitted if not linked yet
 *
 * Variants — pick ONE approach:
 *   1) Explicit list (recommended):
 *        variants: [{ color: 'Black', size: 'M', stock: 10 }, ...]
 *   2) Shorthand matrix:
 *        colors: 'Black,White', sizes: 'S,M,L', defaultStock: 5
 *
 * slug is optional; generated from title if omitted.
 */

module.exports = [
  {
    "title": "Premium Oxford Button-Down Shirt",
    "desc": "Crisp, breathable, and versatile. This classic Oxford shirt features a structured button-down collar and a relaxed chest cut that transitions seamlessly from office hours to weekend dinners.",
    "slug": "premium-oxford-button-down-shirt",
    "price": 45.00,
    "isInStock": true,
    "isDeleted": false,
    "isAboutToBeOut": false,
    "category": { "$oid": "6a1ca6501706237f2315d1ee" },
    "subCategory": { "$oid": "6a1ca6a91706237f2315d210" },
    "tags": ["New Arrival", "Wrinkle-Resistant"],
    "variants": [
      { "color": "Classic White", "size": "S", "stock": 5, "sku": "PREMIUM-OXFORD-BUTTON-DOWN-SHIRT-CLASSIC-WHITE-S" },
      { "color": "Classic White", "size": "M", "stock": 4, "sku": "PREMIUM-OXFORD-BUTTON-DOWN-SHIRT-CLASSIC-WHITE-M" },
      { "color": "Classic White", "size": "L", "stock": 3, "sku": "PREMIUM-OXFORD-BUTTON-DOWN-SHIRT-CLASSIC-WHITE-L" },
      { "color": "Light Blue", "size": "M", "stock": 4, "sku": "PREMIUM-OXFORD-BUTTON-DOWN-SHIRT-LIGHT-BLUE-M" },
      { "color": "Light Blue", "size": "L", "stock": 2, "sku": "PREMIUM-OXFORD-BUTTON-DOWN-SHIRT-LIGHT-BLUE-L" }
    ],
    "specs": ["100% Organic Cotton", "Box-pleat back detail", "Left chest pocket", "Adjustable cuffs"],
    "keywords": ["oxford shirt", "button down", "men formal wear", "white dress shirt", "cotton shirt"],
    "imgUrl": "https://res.cloudinary.com/dzx8bqcol/image/upload/v1780266065/nti-commerce/YOUR_SHIRT_IMAGE_ID.avif",
    "createdAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "updatedAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "__v": 0
  },
  {
    "title": "Minimalist Cotton Crewneck Tee",
    "desc": "The ultimate everyday foundation piece. Knit from heavyweight combed cotton for a smooth exterior finish and an exceptionally soft interior feel that resists pilling.",
    "slug": "minimalist-cotton-crewneck-tee",
    "price": 22.00,
    "isInStock": true,
    "isDeleted": false,
    "isAboutToBeOut": false,
    "category": { "$oid": "6a1ca6501706237f2315d1ee" },
    "subCategory": { "$oid": "6a1ca6a91706237f2315d211" },
    "tags": ["Essential", "Value Pack Available"],
    "variants": [
      { "color": "Off-White", "size": "S", "stock": 10, "sku": "MINIMALIST-COTTON-CREWNECK-TEE-OFF-WHITE-S" },
      { "color": "Off-White", "size": "M", "stock": 12, "sku": "MINIMALIST-COTTON-CREWNECK-TEE-OFF-WHITE-M" },
      { "color": "Off-White", "size": "L", "stock": 8, "sku": "MINIMALIST-COTTON-CREWNECK-TEE-OFF-WHITE-L" },
      { "color": "Heather Gray", "size": "M", "stock": 6, "sku": "MINIMALIST-COTTON-CREWNECK-TEE-HEATHER-GRAY-M" },
      { "color": "Heather Gray", "size": "L", "stock": 7, "sku": "MINIMALIST-COTTON-CREWNECK-TEE-HEATHER-GRAY-L" }
    ],
    "specs": ["100% Combed Cotton", "180 GSM midweight fabric", "Ribbed neck band", "Tagless interior label"],
    "keywords": ["crewneck tee", "basic t-shirt", "plain tee", "cotton tshirt", "men basics"],
    "imgUrl": "https://res.cloudinary.com/dzx8bqcol/image/upload/v1780266065/nti-commerce/YOUR_TEE_IMAGE_ID.avif",
    "createdAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "updatedAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "__v": 0
  },
  {
    "title": "Waterproof Utility Parka Jacket",
    "desc": "Built to withstand the elements without sacrificing style. This heavy-duty parka features a water-repellent shell, deep utility pockets, and an adjustable insulated hood.",
    "slug": "waterproof-utility-parka-jacket",
    "price": 129.99,
    "isInStock": true,
    "isDeleted": false,
    "isAboutToBeOut": false,
    "category": { "$oid": "6a1ca6501706237f2315d1ee" },
    "subCategory": { "$oid": "6a1ca6a91706237f2315d212" },
    "tags": ["Heavy Weather", "Waterproof"],
    "variants": [
      { "color": "Olive Green", "size": "M", "stock": 3, "sku": "WATERPROOF-UTILITY-PARKA-JACKET-OLIVE-GREEN-M" },
      { "color": "Olive Green", "size": "L", "stock": 4, "sku": "WATERPROOF-UTILITY-PARKA-JACKET-OLIVE-GREEN-L" },
      { "color": "Olive Green", "size": "XL", "stock": 2, "sku": "WATERPROOF-UTILITY-PARKA-JACKET-OLIVE-GREEN-XL" },
      { "color": "Charcoal", "size": "M", "stock": 2, "sku": "WATERPROOF-UTILITY-PARKA-JACKET-CHARCOAL-M" },
      { "color": "Charcoal", "size": "L", "stock": 3, "sku": "WATERPROOF-UTILITY-PARKA-JACKET-CHARCOAL-L" }
    ],
    "specs": ["Nylon outer shell", "Polyester quilted lining", "Double-zip closure", "Rated down to 20°F"],
    "keywords": ["winter parka", "waterproof jacket", "utility coat", "outerwear", "mens winter fashion"],
    "imgUrl": "https://res.cloudinary.com/dzx8bqcol/image/upload/v1780266065/nti-commerce/YOUR_PARKA_IMAGE_ID.avif",
    "createdAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "updatedAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "__v": 0
  },
  {
    "title": "Bohemian Floral Maxi Dress",
    "desc": "Flowy, feminine, and beautifully patterned. A lightweight maxi dress with an adjustable wrap waistline, subtle ruffle sleeves, and a tiered A-line skirt that catches the wind perfectly.",
    "slug": "bohemian-floral-maxi-dress",
    "price": 74.50,
    "isInStock": true,
    "isDeleted": false,
    "isAboutToBeOut": false,
    "category": { "$oid": "6a1ca6501706237f2315d1ef" },
    "subCategory": { "$oid": "6a1ca6a91706237f2315d213" },
    "tags": ["Trending", "Lightweight"],
    "variants": [
      { "color": "Sage Floral", "size": "XS", "stock": 3, "sku": "BOHEMIAN-FLORAL-MAXI-DRESS-SAGE-FLORAL-XS" },
      { "color": "Sage Floral", "size": "S", "stock": 5, "sku": "BOHEMIAN-FLORAL-MAXI-DRESS-SAGE-FLORAL-S" },
      { "color": "Sage Floral", "size": "M", "stock": 4, "sku": "BOHEMIAN-FLORAL-MAXI-DRESS-SAGE-FLORAL-M" },
      { "color": "Blush Pink", "size": "S", "stock": 3, "sku": "BOHEMIAN-FLORAL-MAXI-DRESS-BLUSH-PINK-S" },
      { "color": "Blush Pink", "size": "M", "stock": 2, "sku": "BOHEMIAN-FLORAL-MAXI-DRESS-BLUSH-PINK-M" }
    ],
    "specs": ["100% Rayon", "V-neckline", "Partially lined", "Hidden side zipper"],
    "keywords": ["maxi dress", "wrap dress", "floral print", "summer outfit", "boho style"],
    "imgUrl": "https://res.cloudinary.com/dzx8bqcol/image/upload/v1780266065/nti-commerce/YOUR_DRESS_IMAGE_ID.avif",
    "createdAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "updatedAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "__v": 0
  },
  {
    "title": "High-Waisted Wide-Leg Linen Trousers",
    "desc": "Effortless elegance made simple. Crafted from breathable flax-linen blend fabric, these high-waisted trousers feature a flattering wide-leg silhouette and a comfortable elasticized back waistband.",
    "slug": "high-waisted-wide-leg-linen-trousers",
    "price": 65.00,
    "isInStock": true,
    "isDeleted": false,
    "isAboutToBeOut": false,
    "category": { "$oid": "6a1ca6501706237f2315d1ef" },
    "subCategory": { "$oid": "6a1ca6a91706237f2315d214" },
    "tags": ["Eco-Friendly", "Summer Pick"],
    "variants": [
      { "color": "Natural Flax", "size": "S", "stock": 6, "sku": "HIGH-WAISTED-WIDE-LEG-LINEN-TROUSERS-NATURAL-FLAX-S" },
      { "color": "Natural Flax", "size": "M", "stock": 8, "sku": "HIGH-WAISTED-WIDE-LEG-LINEN-TROUSERS-NATURAL-FLAX-M" },
      { "color": "Natural Flax", "size": "L", "stock": 5, "sku": "HIGH-WAISTED-WIDE-LEG-LINEN-TROUSERS-NATURAL-FLAX-L" },
      { "color": "Pure White", "size": "S", "stock": 2, "sku": "HIGH-WAISTED-WIDE-LEG-LINEN-TROUSERS-PURE-WHITE-S" },
      { "color": "Pure White", "size": "M", "stock": 3, "sku": "HIGH-WAISTED-WIDE-LEG-LINEN-TROUSERS-PURE-WHITE-M" }
    ],
    "specs": ["55% Linen", "45% Viscose", "Front pleats", "Functional slash pockets"],
    "keywords": ["linen pants", "wide leg trousers", "high waisted", "summer trousers", "linen clothing"],
    "imgUrl": "https://res.cloudinary.com/dzx8bqcol/image/upload/v1780266065/nti-commerce/YOUR_PANTS_IMAGE_ID.avif",
    "createdAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "updatedAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "__v": 0
  },
  {
    "title": "Oversized Knit Cable Sweater",
    "desc": "Wrap yourself in pure cozy comfort. An oversized knit sweater featuring an intricate vintage cable pattern, dropped shoulders, and a thick ribbed mock-neck design.",
    "slug": "oversized-knit-cable-sweater",
    "price": 55.00,
    "isInStock": true,
    "isDeleted": false,
    "isAboutToBeOut": false,
    "category": { "$oid": "6a1ca6501706237f2315d1ef" },
    "subCategory": { "$oid": "6a1ca6a91706237f2315d215" },
    "tags": ["Top Rated", "Cozy Fit"],
    "variants": [
      { "color": "Creamy Ivory", "size": "S", "stock": 4, "sku": "OVERSIZED-KNIT-CABLE-SWEATER-CREAMY-IVORY-S" },
      { "color": "Creamy Ivory", "size": "M", "stock": 6, "sku": "OVERSIZED-KNIT-CABLE-SWEATER-CREAMY-IVORY-M" },
      { "color": "Creamy Ivory", "size": "L", "stock": 4, "sku": "OVERSIZED-KNIT-CABLE-SWEATER-CREAMY-IVORY-L" },
      { "color": "Dusty Rose", "size": "M", "stock": 3, "sku": "OVERSIZED-KNIT-CABLE-SWEATER-DUSTY-ROSE-M" }
    ],
    "specs": ["70% Acrylic", "30% Wool blend", "Hand wash only", "Heavyweight chunky weave"],
    "keywords": ["cable knit sweater", "oversized pullover", "winter knitwear", "cozy top"],
    "imgUrl": "https://res.cloudinary.com/dzx8bqcol/image/upload/v1780266065/nti-commerce/YOUR_SWEATER_IMAGE_ID.avif",
    "createdAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "updatedAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "__v": 0
  },
  {
    "title": "Ribbed Square-Neck Bodysuit",
    "desc": "The ultimate smoothing layering piece. This sleek bodysuit features a deep flattering square neckline, thick supportive straps, and a snap-closure thong back for zero bunching lines.",
    "slug": "ribbed-square-neck-bodysuit",
    "price": 28.00,
    "isInStock": true,
    "isDeleted": false,
    "isAboutToBeOut": false,
    "category": { "$oid": "6a1ca6501706237f2315d1ef" },
    "subCategory": { "$oid": "6a1ca6a91706237f2315d216" },
    "tags": ["Essentials", "Seamless Look"],
    "variants": [
      { "color": "Onyx Black", "size": "XS", "stock": 5, "sku": "RIBBED-SQUARE-NECK-BODYSUIT-ONYX-BLACK-XS" },
      { "color": "Onyx Black", "size": "S", "stock": 8, "sku": "RIBBED-SQUARE-NECK-BODYSUIT-ONYX-BLACK-S" },
      { "color": "Onyx Black", "size": "M", "stock": 10, "sku": "RIBBED-SQUARE-NECK-BODYSUIT-ONYX-BLACK-M" },
      { "color": "Sand Beige", "size": "S", "stock": 4, "sku": "RIBBED-SQUARE-NECK-BODYSUIT-SAND-BEIGE-S" },
      { "color": "Sand Beige", "size": "M", "stock": 6, "sku": "RIBBED-SQUARE-NECK-BODYSUIT-SAND-BEIGE-M" }
    ],
    "specs": ["92% Nylon", "8% Spandex", "Dual snap closure at base", "Double-lined chest panels"],
    "keywords": ["square neck bodysuit", "ribbed top", "layering piece", "womens tank top"],
    "imgUrl": "https://res.cloudinary.com/dzx8bqcol/image/upload/v1780266065/nti-commerce/YOUR_BODYSUIT_IMAGE_ID.avif",
    "createdAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "updatedAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "__v": 0
  },
  {
    "title": "Premium Oxford Button-Down Shirt",
    "desc": "Crisp, breathable, and versatile. This classic Oxford shirt features a structured button-down collar and a relaxed chest cut that transitions seamlessly from office hours to weekend dinners.",
    "slug": "premium-oxford-button-down-shirt",
    "price": 45.00,
    "isInStock": true,
    "isDeleted": false,
    "isAboutToBeOut": false,
    "category": { "$oid": "6a1ca6501706237f2315d1ee" },
    "subCategory": { "$oid": "6a1ca6a91706237f2315d210" },
    "tags": ["New Arrival", "Wrinkle-Resistant"],
    "variants": [
      { "color": "Classic White", "size": "S", "stock": 5, "sku": "PREMIUM-OXFORD-BUTTON-DOWN-SHIRT-CLASSIC-WHITE-S" },
      { "color": "Classic White", "size": "M", "stock": 4, "sku": "PREMIUM-OXFORD-BUTTON-DOWN-SHIRT-CLASSIC-WHITE-M" },
      { "color": "Classic White", "size": "L", "stock": 3, "sku": "PREMIUM-OXFORD-BUTTON-DOWN-SHIRT-CLASSIC-WHITE-L" },
      { "color": "Light Blue", "size": "M", "stock": 4, "sku": "PREMIUM-OXFORD-BUTTON-DOWN-SHIRT-LIGHT-BLUE-M" },
      { "color": "Light Blue", "size": "L", "stock": 2, "sku": "PREMIUM-OXFORD-BUTTON-DOWN-SHIRT-LIGHT-BLUE-L" }
    ],
    "specs": ["100% Organic Cotton", "Box-pleat back detail", "Left chest pocket", "Adjustable cuffs"],
    "keywords": ["oxford shirt", "button down", "men formal wear", "white dress shirt", "cotton shirt"],
    "imgUrl": "https://res.cloudinary.com/dzx8bqcol/image/upload/v1780266065/nti-commerce/YOUR_SHIRT_IMAGE_ID.avif",
    "createdAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "updatedAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "__v": 0
  },
  {
    "title": "Minimalist Cotton Crewneck Tee",
    "desc": "The ultimate everyday foundation piece. Knit from heavyweight combed cotton for a smooth exterior finish and an exceptionally soft interior feel that resists pilling.",
    "slug": "minimalist-cotton-crewneck-tee",
    "price": 22.00,
    "isInStock": true,
    "isDeleted": false,
    "isAboutToBeOut": false,
    "category": { "$oid": "6a1ca6501706237f2315d1ee" },
    "subCategory": { "$oid": "6a1ca6a91706237f2315d211" },
    "tags": ["Essential", "Value Pack Available"],
    "variants": [
      { "color": "Off-White", "size": "S", "stock": 10, "sku": "MINIMALIST-COTTON-CREWNECK-TEE-OFF-WHITE-S" },
      { "color": "Off-White", "size": "M", "stock": 12, "sku": "MINIMALIST-COTTON-CREWNECK-TEE-OFF-WHITE-M" },
      { "color": "Off-White", "size": "L", "stock": 8, "sku": "MINIMALIST-COTTON-CREWNECK-TEE-OFF-WHITE-L" },
      { "color": "Heather Gray", "size": "M", "stock": 6, "sku": "MINIMALIST-COTTON-CREWNECK-TEE-HEATHER-GRAY-M" },
      { "color": "Heather Gray", "size": "L", "stock": 7, "sku": "MINIMALIST-COTTON-CREWNECK-TEE-HEATHER-GRAY-L" }
    ],
    "specs": ["100% Combed Cotton", "180 GSM midweight fabric", "Ribbed neck band", "Tagless interior label"],
    "keywords": ["crewneck tee", "basic t-shirt", "plain tee", "cotton tshirt", "men basics"],
    "imgUrl": "https://res.cloudinary.com/dzx8bqcol/image/upload/v1780266065/nti-commerce/YOUR_TEE_IMAGE_ID.avif",
    "createdAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "updatedAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "__v": 0
  },
  {
    "title": "Waterproof Utility Parka Jacket",
    "desc": "Built to withstand the elements without sacrificing style. This heavy-duty parka features a water-repellent shell, deep utility pockets, and an adjustable insulated hood.",
    "slug": "waterproof-utility-parka-jacket",
    "price": 129.99,
    "isInStock": true,
    "isDeleted": false,
    "isAboutToBeOut": false,
    "category": { "$oid": "6a1ca6501706237f2315d1ee" },
    "subCategory": { "$oid": "6a1ca6a91706237f2315d212" },
    "tags": ["Heavy Weather", "Waterproof"],
    "variants": [
      { "color": "Olive Green", "size": "M", "stock": 3, "sku": "WATERPROOF-UTILITY-PARKA-JACKET-OLIVE-GREEN-M" },
      { "color": "Olive Green", "size": "L", "stock": 4, "sku": "WATERPROOF-UTILITY-PARKA-JACKET-OLIVE-GREEN-L" },
      { "color": "Olive Green", "size": "XL", "stock": 2, "sku": "WATERPROOF-UTILITY-PARKA-JACKET-OLIVE-GREEN-XL" },
      { "color": "Charcoal", "size": "M", "stock": 2, "sku": "WATERPROOF-UTILITY-PARKA-JACKET-CHARCOAL-M" },
      { "color": "Charcoal", "size": "L", "stock": 3, "sku": "WATERPROOF-UTILITY-PARKA-JACKET-CHARCOAL-L" }
    ],
    "specs": ["Nylon outer shell", "Polyester quilted lining", "Double-zip closure", "Rated down to 20°F"],
    "keywords": ["winter parka", "waterproof jacket", "utility coat", "outerwear", "mens winter fashion"],
    "imgUrl": "https://res.cloudinary.com/dzx8bqcol/image/upload/v1780266065/nti-commerce/YOUR_PARKA_IMAGE_ID.avif",
    "createdAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "updatedAt": { "$date": "2026-05-31T22:21:07.594Z" },
    "__v": 0
  }
]
