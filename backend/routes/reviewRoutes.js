const { Router } = require('express');
const { getReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();
router.get('/:dishId', getReviews);
router.post('/:dishId', protect, createReview);

module.exports = router;
