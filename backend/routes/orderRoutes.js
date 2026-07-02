const { Router } = require('express');
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateStatus);

module.exports = router;
