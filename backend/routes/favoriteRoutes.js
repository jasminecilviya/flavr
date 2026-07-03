const { Router } = require('express');
const { getFavorites, toggleFavorite, getFavoriteIds } = require('../controllers/favoriteController');
const { protect } = require('../middlewares/authMiddleware');

const router = Router();
router.get('/', protect, getFavorites);
router.get('/ids', protect, getFavoriteIds);
router.post('/:dishId', protect, toggleFavorite);

module.exports = router;
