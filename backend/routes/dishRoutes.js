const { Router } = require('express');
const { getDishes, getDish, createDish, updateDish, deleteDish } = require('../controllers/dishController');
const { protect, admin } = require('../middlewares/authMiddleware');
const uploadImage = require('../middlewares/uploadMiddleware');

const router = Router();
router.get('/', getDishes);
router.get('/:id', getDish);
router.post('/', protect, admin, uploadImage, createDish);
router.put('/:id', protect, admin, uploadImage, updateDish);
router.delete('/:id', protect, admin, deleteDish);

module.exports = router;
