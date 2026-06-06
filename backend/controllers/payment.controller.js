const Stripe = require('stripe');
const Cart = require('../models/cart.model');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * POST /api/payment/create-payment-intent
 * Creates a Stripe PaymentIntent for the authenticated user's cart total.
 * Returns clientSecret used by the frontend Stripe Elements.
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(400).json({ message: 'User not authenticated' });

    const cart = await Cart.findOne({ user: userId });
    if (!cart || !cart.products.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total in cents (Stripe uses smallest currency unit)
    const subtotal = cart.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const deliveryFee = cart.delivery?.fee || 0;

    // Tax rate: 8% (matches what frontend shows)
    const TAX_RATE = 0.08;
    const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;

    const total = subtotal + deliveryFee + taxAmount;
    const amountInCents = Math.round(total * 100);

    if (amountInCents < 50) {
      return res.status(400).json({ message: 'Cart total is too low to process payment' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        userId: userId.toString(),
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        tax: taxAmount.toFixed(2),
      },
    });

    return res.status(200).json({
      message: 'Payment intent created',
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: total,
        tax: taxAmount,
        subtotal,
        deliveryFee,
      },
    });
  } catch (error) {
    console.error('createPaymentIntent error:', error);
    return res.status(500).json({ message: error.message });
  }
};
