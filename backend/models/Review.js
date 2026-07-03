const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

reviewSchema.index({ dish: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
