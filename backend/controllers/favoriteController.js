const Favorite = require('../models/Favorite');
const { asyncHandler } = require('../middlewares/errorMiddleware');

// GET /api/favorites
exports.getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .populate({ path: 'dish', populate: { path: 'restaurant', select: 'name' } })
    .sort('-createdAt');
  const dishes = favorites.map(f => f.dish).filter(Boolean);
  res.json(dishes);
});

// POST /api/favorites/:dishId — toggle
exports.toggleFavorite = asyncHandler(async (req, res) => {
  const { dishId } = req.params;
  const existing = await Favorite.findOne({ user: req.user._id, dish: dishId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ favorited: false });
  }
  await Favorite.create({ user: req.user._id, dish: dishId });
  res.json({ favorited: true });
});

// GET /api/favorites/ids — get set of favorite dish IDs
exports.getFavoriteIds = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id }).select('dish');
  res.json(favorites.map(f => f.dish.toString()));
});
