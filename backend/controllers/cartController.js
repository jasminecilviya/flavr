const Cart = require('../models/Cart');
const { asyncHandler } = require('../middlewares/errorMiddleware');

// GET /api/cart
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.dish');
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  res.json(cart);
});

// POST /api/cart — add or update quantity
exports.addToCart = asyncHandler(async (req, res) => {
  const { dishId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existing = cart.items.find((i) => i.dish.toString() === dishId);
  if (existing) {
    existing.quantity += quantity || 1;
  } else {
    cart.items.push({ dish: dishId, quantity: quantity || 1 });
  }
  await cart.save();
  cart = await Cart.findOne({ user: req.user._id }).populate('items.dish');
  res.json(cart);
});

// DELETE /api/cart/:itemId
exports.removeFromCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();
  cart = await Cart.findOne({ user: req.user._id }).populate('items.dish');
  res.json(cart);
});
