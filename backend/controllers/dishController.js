const Dish = require('../models/Dish');
const { asyncHandler } = require('../middlewares/errorMiddleware');

// GET /api/dishes
exports.getDishes = asyncHandler(async (req, res) => {
  const filter = { isAvailable: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
  if (req.query.minPrice) filter.price = { ...filter.price, $gte: Number(req.query.minPrice) };
  if (req.query.maxPrice) filter.price = { ...filter.price, $lte: Number(req.query.maxPrice) };
  if (req.query.minRating) filter.rating = { $gte: Number(req.query.minRating) };
  // admin can see all
  if (req.query.admin === 'true') delete filter.isAvailable;

  const dishes = await Dish.find(filter)
    .populate('restaurant', 'name imageUrl')
    .populate('menu', 'categories')
    .sort({ rating: -1 });
  res.json(dishes);
});

// GET /api/dishes/:id
exports.getDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id)
    .populate('restaurant', 'name imageUrl address')
    .populate('menu', 'categories');
  if (!dish) return res.status(404).json({ message: 'Dish not found' });
  res.json(dish);
});

// POST /api/dishes — Admin
exports.createDish = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.imageUrl = req.file.path;
  // Parse JSON fields if sent as string (multipart)
  if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);
  if (typeof data.price === 'string') data.price = Number(data.price);
  if (typeof data.rating === 'string') data.rating = Number(data.rating);

  const dish = await Dish.create(data);
  res.status(201).json(dish);
});

// PUT /api/dishes/:id — Admin
exports.updateDish = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.imageUrl = req.file.path;
  if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);
  if (typeof data.price === 'string') data.price = Number(data.price);
  if (typeof data.rating === 'string') data.rating = Number(data.rating);

  const dish = await Dish.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!dish) return res.status(404).json({ message: 'Dish not found' });
  res.json(dish);
});

// DELETE /api/dishes/:id — Admin
exports.deleteDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findByIdAndDelete(req.params.id);
  if (!dish) return res.status(404).json({ message: 'Dish not found' });
  res.json({ message: 'Dish removed' });
});
