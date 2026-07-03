const { Router } = require('express');
const { recommend, chat, stream, mealPlan } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();

router.post('/recommend', protect, recommend);
router.post('/chat', protect, chat);
router.post('/stream', protect, stream);
router.post('/meal-plan', protect, mealPlan);

module.exports = router;
