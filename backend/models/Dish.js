const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String },
    category: { type: String, required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    tags: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dish', dishSchema);
