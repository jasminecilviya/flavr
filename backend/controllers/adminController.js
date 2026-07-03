const User = require('../models/User');
const Order = require('../models/Order');
const Dish = require('../models/Dish');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const Cart = require('../models/Cart');
const Favorite = require('../models/Favorite');
const { asyncHandler } = require('../middlewares/errorMiddleware');

// ─── Users ──────────────────────────────────────
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort('-createdAt');
  res.json(users);
});

// ─── Orders ─────────────────────────────────────
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .populate('items.dish', 'name price imageUrl')
    .sort('-createdAt');
  res.json(orders);
});

// ─── Stats Dashboard ────────────────────────────
exports.getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalOrders, totalDishes, totalReviews, revenueResult, ordersByStatus, topDishes, monthlyRevenue] = await Promise.all([
    User.countDocuments({}),
    Order.countDocuments({}),
    Dish.countDocuments({}),
    Review.countDocuments({}),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Dish.find({ isAvailable: true }).populate('restaurant', 'name').sort({ rating: -1 }).limit(10).lean(),
    Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;
  const statusMap = {};
  ordersByStatus.forEach(s => { statusMap[s._id] = s.count; });

  res.json({
    totalUsers, totalOrders, totalDishes, totalReviews, totalRevenue,
    ordersByStatus: statusMap, topDishes, monthlyRevenue,
    pendingOrders: statusMap['Pending'] || 0,
  });
});

// ─── Coupons ────────────────────────────────────
exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort('-createdAt');
  res.json(coupons);
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
});

exports.toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.json(coupon);
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Coupon deleted' });
});

// ─── Reseed Coupons ─────────────────────────────
const COUPON_SEED = [
  { code: 'FLAVR50', discountType: 'percentage', discountValue: 50, maxDiscount: 200, minOrderAmount: 499, usageLimit: 50 },
  { code: 'WELCOME100', discountType: 'flat', discountValue: 100, minOrderAmount: 299, usageLimit: 100 },
  { code: 'FREEDEL', discountType: 'flat', discountValue: 50, minOrderAmount: 199, usageLimit: 200 },
];

exports.reseedCoupons = asyncHandler(async (req, res) => {
  await Coupon.deleteMany({});
  const coupons = await Coupon.create(COUPON_SEED);
  res.json({ message: `✅ ${coupons.length} coupons seeded`, coupons });
});

// ─── Reseed Coupons (admin only) ───────────────
