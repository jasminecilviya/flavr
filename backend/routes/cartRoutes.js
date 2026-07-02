const { Router } = require('express');
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.delete('/:itemId', protect, removeFromCart);

module.exports = router;
