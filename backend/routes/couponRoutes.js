const { Router } = require('express');
const Coupon = require('../models/Coupon');
const { asyncHandler } = require('../middlewares/errorMiddleware');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();

// POST /api/coupons/validate — validate and apply a coupon
router.post('/validate', protect, asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  if (!code) return res.status(400).json({ message: 'Coupon code required' });

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return res.status(404).json({ valid: false, message: 'Invalid or expired coupon' });

  // Check expiry
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return res.status(400).json({ valid: false, message: 'Coupon has expired' });
  }

  // Check usage limit
  if (coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ valid: false, message: 'Coupon usage limit reached' });
  }

  // Check min order
  if (amount < coupon.minOrderAmount) {
    return res.status(400).json({
      valid: false,
      message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((amount * coupon.discountValue) / 100);
    if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.discountValue;
  }

  res.json({
    valid: true,
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      description: coupon.discountType === 'percentage'
        ? `${coupon.discountValue}% OFF${coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount})` : ''}`
        : `₹${discount} OFF`,
    },
  });
}));

// PUT /api/coupons/apply — claim usage (called after order placed)
router.put('/apply', protect, asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOneAndUpdate(
    { code: code.toUpperCase(), isActive: true },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  res.json({ message: 'Coupon applied', coupon });
}));

module.exports = router;
