const { Router } = require('express');
const { recommend } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();

router.post('/recommend', protect, recommend);

module.exports = router;
