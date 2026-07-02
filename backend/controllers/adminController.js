const User = require('../models/User');
const Order = require('../models/Order');
const { asyncHandler } = require('../middlewares/errorMiddleware');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .populate('items.dish', 'name price')
    .sort('-createdAt');
  res.json(orders);
});
