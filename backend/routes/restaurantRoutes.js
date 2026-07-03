const { Router } = require('express');
const { getRestaurants, createRestaurant } = require('../controllers/restaurantController');
const { protect, admin } = require('../middlewares/authMiddleware');
const uploadImage = require('../middlewares/uploadMiddleware');

const router = Router();
router.get('/', getRestaurants);
router.post('/', protect, admin, uploadImage, createRestaurant);

module.exports = router;
