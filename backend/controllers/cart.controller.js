const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const { findVariant, deductVariantStock, ensureVariants } = require("../utils/productStock");
const { response } = require("express");



exports.getCart = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        
        if (!userId) {
            console.log('No userId found');
            return res.status(400).json({ message: "User ID not found in token" });
        }
        
        console.log('userId:', userId);
        
        // Find cart by user field, not by _id
        let cart = await Cart.findOne({ user: userId }).populate("products.product","");
        
        if (!cart) {
            // Create a new cart if none exists
            cart = await Cart.create({ 
                user: userId, 
                products: [],
                delivery: {},
                totalPrice: 0,
                totalItems: 0
            });
        }
        
        console.log('Cart found/created:', cart);
        res.json({ message: "cart:", data: cart });
        
    } catch (error) {
        console.error('getCart error:', error);
        res.status(500).json({ message: error.message });
    }
};

// exports.mergeCart = async (req, res) => {
//     try {
//         const userId = req.user._id || req.user.id; // Fix: use _id first
//         const { products = [] } = req.body;

//         console.log('=== mergeCart called ===');
//         console.log('userId:', userId);
//         console.log('products to merge:', products);

//         // if (!products.length) {
//         //     return res.status(400).json({ message: "No products to sync." });
//         // }

//         let cart = await Cart.findOne({ user: userId });
//         if (!cart) {
//             cart = new Cart({ 
//                 user: userId,
//                 products: [],
//                 totalPrice: 0,
//                 totalItems: 0,
//                 delivery: { id: "1", date: new Date().now(), fee: 0 }
//             });
//         }

 
//         cart.products=products;

//         // Calculate totals
//         cart.totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);
//         cart.totalPrice = cart.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);

//         await cart.save();
//         console.log('Cart merged successfully:', cart);
//         res.status(200).json({ message: "Cart merged successfully", data: cart });
//     } catch (error) {
//         console.error('mergeCart error:', error);
//         res.status(500).json({ message: "Failed to merge cart", error: error.message });
//     }
// };

// Merge local cart data into user's backend cart
exports.mergeCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { products = [], delivery = {} } = req.body;

    console.log("=== mergeCart called ===");
    console.log("userId:", userId);
    console.log("products:", JSON.stringify(products, null, 2));
    console.log("delivery:", delivery);

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        products: [],
        totalPrice: 0,
        totalItems: 0,
        delivery: { id: null, date: null, fee: 0 },
      });
    }

    cart.products = products || [];

    // Validate variant stock for each cart line before saving
    for (const item of cart.products) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct || dbProduct.isDeleted) {
        return res.status(400).json({ message: "One or more products in cart are unavailable." });
      }

      const variant = findVariant(dbProduct, item.color || "", item.size || "");
      if (!variant) {
        return res.status(400).json({
          message: `Variant not available for ${dbProduct.title} (${item.color || "default"} / ${item.size || "default"}).`,
        });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${dbProduct.title} (${item.color || "default"} / ${item.size || "default"}). Available: ${variant.stock}`,
        });
      }
    }

    if (delivery?.id) {
      const parsedDate = new Date(delivery.date);
      cart.delivery = {
        id: delivery.id,
        date: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
        fee: delivery.fee ?? 0,
      };
    } else if (cart.products.length > 0) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      cart.delivery = {
        id: 'option1',
        date: defaultDate,
        fee: 0,
      };
    }

    cart.totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();
    console.log("✅ Cart merged successfully:", cart);
    res.status(200).json({ message: "Cart merged successfully", data: cart });
  } catch (error) {
    console.error("❌ mergeCart error:", error);
    res.status(500).json({
      message: "Failed to merge cart",
      error: error.message,
      stack: error.stack,
    });
  }
};


exports.checkout = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { fullName, email, phone, address, city, zip } = req.body || {};

    // 🧩 1️⃣ Fetch user and cart
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const cart = await Cart.findOne({ user: userId }).populate("products.product");
   if (!cart || !cart.products.length) {
  console.log("❌ Cart not found or empty:", cart);
  return res.status(400).json({ message: "Your cart is empty." });
}

    console.log("Fetched Cart:", cart);

    // 🧩 2️⃣ Validate delivery
    if (!cart.delivery || !cart.delivery.id || !cart.delivery.date || cart.delivery.fee == null) {
  console.log("❌ Missing delivery info:", cart.delivery);
  return res.status(400).json({ message: "Delivery info missing in cart." });
}

    // Validate stock for each product variant and update it
    for (const item of cart.products) {
      const dbProduct = await Product.findById(item.product._id);
      if (!dbProduct) {
        return res.status(404).json({ message: `Product ${item.product._id} not found.` });
      }

      const variant = findVariant(dbProduct, item.color || "", item.size || "");
      if (!variant) {
        return res.status(400).json({
          message: `Variant not available for ${dbProduct.title}.`,
        });
      }

      const result = deductVariantStock(dbProduct, item.color || "", item.size || "", item.quantity);
      if (!result.ok) {
        return res.status(400).json({
          message: `Not enough stock for ${dbProduct.title} (${item.color || "default"} / ${item.size || "default"}). Available: ${result.available}`,
        });
      }

      await dbProduct.save();
    }

    // 🟣 4️⃣ Calculate total price
    const subtotal = cart.products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    const total = subtotal + (cart.delivery.fee || 0);

    const shippingAddress = [address, city, zip]
      .map((part) => (part ? String(part).trim() : ''))
      .filter(Boolean);
    const fallbackAddress = Array.isArray(user.address)
      ? user.address.filter(Boolean)
      : [];

    const newOrder = await Order.create({
      user: user._id,
      products: cart.products.map((p) => ({
        product: p.product._id,
        price: p.price,
        quantity: p.quantity,
        color: p.color || "",
        size: p.size || "",
      })),
      totalPrice: total,
      shippingName: fullName || user.name || '',
      shippingEmail: email || user.email || '',
      phone: phone || user.phone || '',
      address: shippingAddress.length ? shippingAddress : fallbackAddress,
      delivery: {
        id: cart.delivery.id,
        date: cart.delivery.date,
        fee: cart.delivery.fee,
      },
      orderStat: "pending",
      orderedAt: new Date(),
    });

    // 🟢 6️⃣ Add order to user’s list
    user.orders.push(newOrder._id);
    await user.save();

    // 🟣 7️⃣ Clear the cart
    cart.products = [];
    cart.delivery = { id: null, date: null, fee: 0 };
    cart.totalPrice = 0;
    cart.totalItems = 0;
    await cart.save();

    console.log("✅ Checkout successful:", newOrder);

    res.status(201).json({
      message: "Checkout successful",
      data: newOrder,
    });
  } catch (error) {
    console.error("❌ Checkout error:", error);
    res.status(500).json({
      message: "Checkout failed",
      error: error.message,
    });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { productId } = req.params; // expect productId from URL like /cart/:productId

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    // 🧩 Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // 🧹 Filter out the product to delete
    const initialLength = cart.products.length;
    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.products.length === initialLength) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    // 🧮 Recalculate totals
    cart.totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();

    return res.status(200).json({
      message: "Product removed from cart successfully.",
      data: cart,
    });
  } catch (error) {
    console.error("deleteCart error:", error);
    res.status(500).json({ message: "Failed to delete product from cart", error: error.message });
  }
};
    exports.addOneItem = async (req, res) => {
    try {
      const userId = req.user?._id || req.user?.id;
      const {productId} = req.params;
      const { color = "", size = "" } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID not found in token" });
      }
  
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required." });
      }
  
      // 🧩 Find user's cart (or create one if not exists)
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = await Cart.create({ user: userId, products: [] });
      }
  
      // 🧩 Find product in database
      const product = await Product.findOne({ _id: productId, isDeleted: false });
      if (!product) {
        return res.status(404).json({ message: "Product not found or deleted." });
      }

      ensureVariants(product);

      const existingItem = cart.products.find(
        (p) => p.product.toString() === productId && p.color === color && p.size === size
      );

      const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
      const variant = findVariant(product, color, size);

      if (!variant) {
        return res.status(400).json({
          message: `This color/size combination is not available for ${product.title}.`,
        });
      }

      if (variant.stock < newQuantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.title} (${color || "default"} / ${size || "default"}). Available: ${variant.stock}`,
        });
      }

      const itemPrice = variant.price ?? product.price;

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.products.push({
          product: productId,
          quantity: 1,
          price: itemPrice,
          color,
          size
        });
      }
  
      await cart.save();
  
      return res.status(200).json({
        message: "Product added to cart successfully.",
        data: cart,
      });
    } catch (error) {
      console.error("addOneItem error:", error);
      res.status(500).json({
        message: "Failed to add product to cart",
        error: error.message,
      });
    }
  };
  