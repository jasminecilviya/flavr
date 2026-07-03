const mongoose = require('mongoose');

// LOGIC: One user can favorite many dishes. One dish can be favorited by many users.
const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, dish: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
