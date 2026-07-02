const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    categories: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);
