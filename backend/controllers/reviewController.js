const Review = require('../models/Review');
const Dish = require('../models/Dish');
const { asyncHandler } = require('../middlewares/errorMiddleware');

// GET /api/reviews/:dishId
exports.getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ dish: req.params.dishId })
    .populate('user', 'name')
    .sort('-createdAt');
  res.json(reviews);
});

// POST /api/reviews/:dishId
exports.createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be 1-5' });
  }

  // Upsert — one review per user per dish
  const review = await Review.findOneAndUpdate(
    { user: req.user._id, dish: req.params.dishId },
    { rating, comment },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate('user', 'name');

  // Recalculate dish rating
  const stats = await Review.aggregate([
    { $match: { dish: review.dish } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Dish.findByIdAndUpdate(review.dish, {
      rating: Math.round(stats[0].avg * 10) / 10,
    });
  }

  res.json(review);
});
