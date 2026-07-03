const { Router } = require('express');
const {
  getUsers, getOrders, getStats,
  getCoupons, createCoupon, toggleCoupon, deleteCoupon,
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = Router();

router.get('/users', protect, admin, getUsers);
router.get('/orders', protect, admin, getOrders);
router.get('/stats', protect, admin, getStats);
router.get('/coupons', protect, admin, getCoupons);
router.post('/coupons', protect, admin, createCoupon);
router.put('/coupons/:id/toggle', protect, admin, toggleCoupon);
router.delete('/coupons/:id', protect, admin, deleteCoupon);

module.exports = router;
