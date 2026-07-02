const { Router } = require('express');
const { getUsers, getOrders } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = Router();

router.get('/users', protect, admin, getUsers);
router.get('/orders', protect, admin, getOrders);

module.exports = router;
