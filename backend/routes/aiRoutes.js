const { Router } = require('express');
const { recommend, chat } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();

router.post('/recommend', protect, recommend);
router.post('/chat', protect, chat);

module.exports = router;
