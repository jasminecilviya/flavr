require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Menu = require('./models/Menu');
const Dish = require('./models/Dish');

const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Restaurant.deleteMany({}),
    Menu.deleteMany({}),
    Dish.deleteMany({}),
  ]);

  // Create admin user
  const admin = await User.create({
    name: 'Admin Flavr',
    email: 'admin@flavr.com',
    password: 'admin123',
    role: 'admin',
  });

  // Create regular users
  const user = await User.create({
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'user123',
    preferences: ['vegetarian', 'spicy', 'high-protein'],
  });

  // Restaurants
  const r1 = await Restaurant.create({
    name: 'Bombay Bistro',
    address: 'Andheri West, Mumbai',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/flavr/bombay-bistro',
  });
  const r2 = await Restaurant.create({
    name: 'Punjab Grill',
    address: 'Connaught Place, Delhi',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/flavr/punjab-grill',
  });
  const r3 = await Restaurant.create({
    name: 'Coastal Kitchen',
    address: 'MG Road, Bangalore',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/flavr/coastal-kitchen',
  });

  // Menus
  const m1 = await Menu.create({ restaurantId: r1._id, categories: ['Breakfast', 'Lunch', 'Dinner'] });
  const m2 = await Menu.create({ restaurantId: r2._id, categories: ['Lunch', 'Dinner'] });
  const m3 = await Menu.create({ restaurantId: r3._id, categories: ['Breakfast', 'Lunch', 'Dinner', 'Beverages'] });

  // Link menus to restaurants
  r1.menuId = m1._id; await r1.save();
  r2.menuId = m2._id; await r2.save();
  r3.menuId = m3._id; await r3.save();

  // Dishes
  const dishes = [
    // Bombay Bistro
    { name: 'Masala Dosa', description: 'Crispy rice crepe with potato filling served with chutneys', price: 149, category: 'Breakfast', restaurant: r1._id, menu: m1._id, tags: ['veg', 'healthy'], rating: 4.5 },
    { name: 'Pav Bhaji', description: 'Buttered bun with spiced mixed vegetable mash', price: 179, category: 'Lunch', restaurant: r1._id, menu: m1._id, tags: ['veg', 'spicy'], rating: 4.3 },
    { name: 'Chicken Tikka', description: 'Chargrilled marinated chicken pieces with mint chutney', price: 299, category: 'Dinner', restaurant: r1._id, menu: m1._id, tags: ['non-veg', 'spicy', 'high-protein'], rating: 4.7 },
    { name: 'Vada Pav', description: 'Mumbai style potato fritter sandwich', price: 49, category: 'Breakfast', restaurant: r1._id, menu: m1._id, tags: ['veg'], rating: 4.1 },
    { name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry with butter', price: 349, category: 'Dinner', restaurant: r1._id, menu: m1._id, tags: ['non-veg', 'high-protein'], rating: 4.8 },
    { name: 'Idli Sambar', description: 'Steamed rice cakes with lentil soup', price: 99, category: 'Breakfast', restaurant: r1._id, menu: m1._id, tags: ['veg', 'healthy'], rating: 4.2 },

    // Punjab Grill
    { name: 'Dal Makhani', description: 'Slow cooked black lentils in rich creamy gravy', price: 249, category: 'Lunch', restaurant: r2._id, menu: m2._id, tags: ['veg', 'healthy'], rating: 4.6 },
    { name: 'Tandoori Chicken', description: 'Whole chicken marinated in yogurt and spices, clay oven baked', price: 399, category: 'Dinner', restaurant: r2._id, menu: m2._id, tags: ['non-veg', 'high-protein'], rating: 4.9 },
    { name: 'Paneer Butter Masala', description: 'Cottage cheese in creamy tomato gravy', price: 279, category: 'Lunch', restaurant: r2._id, menu: m2._id, tags: ['veg', 'high-protein'], rating: 4.4 },
    { name: 'Naan Basket', description: 'Assortment of butter naan, garlic naan, and roti', price: 149, category: 'Lunch', restaurant: r2._id, menu: m2._id, tags: ['veg'], rating: 4.3 },
    { name: 'Rogan Josh', description: 'Kashmiri lamb curry with aromatic spices', price: 449, category: 'Dinner', restaurant: r2._id, menu: m2._id, tags: ['non-veg', 'spicy'], rating: 4.7 },
    { name: 'Kheer', description: 'Traditional rice pudding with cardamom and nuts', price: 129, category: 'Dinner', restaurant: r2._id, menu: m2._id, tags: ['veg', 'healthy'], rating: 4.5 },

    // Coastal Kitchen
    { name: 'Appam with Stew', description: 'Lacy fermented rice pancake with vegetable stew', price: 199, category: 'Breakfast', restaurant: r3._id, menu: m3._id, tags: ['veg', 'healthy'], rating: 4.3 },
    { name: 'Fish Curry Rice', description: 'Tangy coconut fish curry served with steamed rice', price: 329, category: 'Lunch', restaurant: r3._id, menu: m3._id, tags: ['non-veg', 'high-protein', 'healthy'], rating: 4.6 },
    { name: 'Prawn Ghee Roast', description: 'Crispy prawns roasted in ghee and special masala', price: 399, category: 'Dinner', restaurant: r3._id, menu: m3._id, tags: ['non-veg', 'spicy'], rating: 4.8 },
    { name: 'Coconut Water', description: 'Fresh tender coconut water', price: 49, category: 'Beverages', restaurant: r3._id, menu: m3._id, tags: ['veg', 'healthy'], rating: 4.0 },
    { name: 'Mango Lassi', description: 'Chilled yogurt drink with alphonso mango pulp', price: 99, category: 'Beverages', restaurant: r3._id, menu: m3._id, tags: ['veg'], rating: 4.4 },
    { name: 'Meen Pollichathu', description: 'Kerala style banana leaf wrapped pearl spot fish', price: 449, category: 'Dinner', restaurant: r3._id, menu: m3._id, tags: ['non-veg', 'healthy', 'high-protein'], rating: 4.9 },

    // More Bombay Bistro
    { name: 'Chole Bhature', description: 'Spicy chickpea curry with fried bread', price: 199, category: 'Lunch', restaurant: r1._id, menu: m1._id, tags: ['veg', 'spicy'], rating: 4.4 },
    { name: 'Biryani', description: 'Hyderabadi dum biryani with tender chicken', price: 349, category: 'Dinner', restaurant: r1._id, menu: m1._id, tags: ['non-veg', 'spicy', 'high-protein'], rating: 4.9 },
    { name: 'Rava Dosa', description: 'Crispy semolina crepe with chutney', price: 129, category: 'Breakfast', restaurant: r1._id, menu: m1._id, tags: ['veg'], rating: 4.2 },

    // More Punjab Grill
    { name: 'Amritsari Kulcha', description: 'Stuffed bread with chole and pickled onions', price: 179, category: 'Lunch', restaurant: r2._id, menu: m2._id, tags: ['veg'], rating: 4.5 },
    { name: 'Shahi Paneer', description: 'Royal paneer in rich nutty gravy', price: 299, category: 'Dinner', restaurant: r2._id, menu: m2._id, tags: ['veg', 'high-protein'], rating: 4.6 },
    { name: 'Chicken Korma', description: 'Mughlai style chicken in cashew cream sauce', price: 379, category: 'Dinner', restaurant: r2._id, menu: m2._id, tags: ['non-veg'], rating: 4.4 },

    // More Coastal Kitchen
    { name: 'Putu Mayam', description: 'Steamed rice noodles with coconut and jaggery', price: 79, category: 'Breakfast', restaurant: r3._id, menu: m3._id, tags: ['veg'], rating: 4.1 },
    { name: 'Squid Fry', description: 'Crispy Kerala style squid rings', price: 299, category: 'Dinner', restaurant: r3._id, menu: m3._id, tags: ['non-veg', 'spicy', 'high-protein'], rating: 4.5 },
    { name: 'Fresh Lime Soda', description: 'Fresh lime juice with soda water', price: 39, category: 'Beverages', restaurant: r3._id, menu: m3._id, tags: ['veg', 'healthy'], rating: 4.0 },
    { name: 'Malabar Parotta', description: 'Flaky layered flatbread with salna', price: 89, category: 'Lunch', restaurant: r3._id, menu: m3._id, tags: ['veg'], rating: 4.3 },
    { name: 'Ela Ada', description: 'Steamed rice dumplings with sweet coconut filling', price: 69, category: 'Breakfast', restaurant: r3._id, menu: m3._id, tags: ['veg', 'healthy'], rating: 4.2 },
    { name: 'Chicken Chettinad', description: 'Fiery Chettinad style chicken curry', price: 349, category: 'Dinner', restaurant: r3._id, menu: m3._id, tags: ['non-veg', 'spicy'], rating: 4.7 },
  ];

  await Dish.insertMany(dishes.map((d, i) => ({
    ...d,
    imageUrl: `https://images.unsplash.com/photo-${[
      '1600891964092-4316c288032e',
      '1555939594-58d7cb561ad1',
      '1598515214211-89f3f73b8270',
      '1626132628386-99d5b3d3b9c5',
      '1604908171895-1c04f2a23590',
      '1596792270654-9ef5c36b19c7',
      '1585937421612-70a008356fbe',
      '1626082920389-63b7b76ccf47',
      '1631451093875-4a2af13254ce',
      '1565557623262-b1c5d5f9d9a2',
      '1603360949113-7e9b4e5e5f5e',
      '1600189802090-e1a1b7f5e1b1',
      '1596792270654-9ef5c36b19c7',
      '1555939594-58d7cb561ad1',
      '1598515214211-89f3f73b8270',
      '1600891964092-4316c288032e',
      '1596792270654-9ef5c36b19c7',
      '1603360949113-7e9b4e5e5f5e',
      '1604908171895-1c04f2a23590',
      '1626132628386-99d5b3d3b9c5',
      '1598515214211-89f3f73b8270',
      '1555939594-58d7cb561ad1',
      '1626082920389-63b7b76ccf47',
      '1585937421612-70a008356fbe',
      '1603360949113-7e9b4e5e5f5e',
      '1600891964092-4316c288032e',
      '1596792270654-9ef5c36b19c7',
      '1555939594-58d7cb561ad1',
      '1626132628386-99d5b3d3b9c5',
      '1604908171895-1c04f2a23590',
    ][i] || '1600891964092-4316c288032e')}?w=800&h=600&fit=crop`,
  })));

  console.log(`
✅ Flavr seeded!
   Admin: admin@flavr.com / admin123
   User:  priya@example.com / user123
   Restaurants: 3 | Dishes: ${dishes.length}
  `);
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
