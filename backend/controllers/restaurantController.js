const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const { asyncHandler } = require('../middlewares/errorMiddleware');

exports.getRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find().populate('menuId');
  res.json(restaurants);
});

exports.createRestaurant = asyncHandler(async (req, res) => {
  const { name, address, categories } = req.body;
  const restaurant = await Restaurant.create({
    name,
    address,
    imageUrl: req.file?.path,
  });
  const menu = await Menu.create({ restaurantId: restaurant._id, categories: categories || [] });
  restaurant.menuId = menu._id;
  await restaurant.save();
  res.status(201).json(restaurant);
});
