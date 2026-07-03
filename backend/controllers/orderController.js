const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const { asyncHandler } = require('../middlewares/errorMiddleware');
const Stripe = require('stripe');

// POST /api/orders — creates Stripe Checkout Session
exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, couponCode, discount } = req.body;

  // Get user's cart with populated dish data
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.dish');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  // Build order items from cart
  const items = cart.items.map((i) => ({
    dish: i.dish._id,
    quantity: i.quantity,
    price: i.dish.price,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const appliedDiscount = discount || 0;
  const totalAmount = Math.max(0, subtotal - appliedDiscount);

  // Apply coupon usage if provided
  if (couponCode) {
    await Coupon.findOneAndUpdate(
      { code: couponCode.toUpperCase(), isActive: true },
      { $inc: { usedCount: 1 } }
    ).catch(() => {}); // Non-blocking
  }

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items,
    totalAmount,
    discount: appliedDiscount,
    couponCode: couponCode ? couponCode.toUpperCase() : undefined,
    shippingAddress,
  });

  // Stripe Checkout Session
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const lineItems = cart.items.map((i) => ({
      price_data: {
        currency: 'inr',
        product_data: { name: i.dish.name },
        unit_amount: Math.round(i.dish.price * 100),
      },
      quantity: i.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/orders?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/cart?cancelled=true`,
      metadata: { orderId: order._id.toString() },
    });

    cart.items = [];
    await cart.save();
    return res.json({ url: session.url, orderId: order._id });
  }

  // Fallback: auto-approve
  order.paymentResult = { id: 'demo', status: 'completed' };
  order.status = 'Preparing';
  await order.save();
  cart.items = [];
  await cart.save();

  res.json({ url: null, orderId: order._id, demo: true });
});

// GET /api/orders/myorders
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.dish', 'name imageUrl price')
    .sort('-createdAt');
  res.json(orders);
});

// GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'items.dish',
    'name imageUrl price'
  );
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(order);
});

// PUT /api/orders/:id/status — Admin
exports.updateStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});
