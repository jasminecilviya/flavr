require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Menu = require('./models/Menu');
const Dish = require('./models/Dish');
const Coupon = require('./models/Coupon');

const connectDB = require('./config/db');

const FOOD_IMAGES = [
  '1600891964092-4316c288032e', '1555939594-58d7cb561ad1', '1598515214211-89f3f73b8270', '1626132628386-99d5b3d3b9c5',
  '1604908171895-1c04f2a23590', '1596792270654-9ef5c36b19c7', '1585937421612-70a008356fbe', '1626082920389-63b7b76ccf47',
  '1631451093875-4a2af13254ce', '1565557623262-b1c5d5f9d9a2', '1603360949113-7e9b4e5e5f5e', '1600189802090-e1a1b7f5e1b1',
  '1596792270654-9ef5c36b19c7', '1555939594-58d7cb561ad1', '1598515214211-89f3f73b8270', '1600891964092-4316c288032e',
  '1596792270654-9ef5c36b19c7', '1603360949113-7e9b4e5e5f5e', '1604908171895-1c04f2a23590', '1626132628386-99d5b3d3b9c5',
  '1598515214211-89f3f73b8270', '1555939594-58d7cb561ad1', '1626082920389-63b7b76ccf47', '1585937421612-70a008356fbe',
  '1603360949113-7e9b4e5e5f5e', '1600891964092-4316c288032e', '1596792270654-9ef5c36b19c7', '1555939594-58d7cb561ad1',
  '1626132628386-99d5b3d3b9c5', '1604908171895-1c04f2a23590',
];

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Restaurant.deleteMany({}),
    Menu.deleteMany({}),
    Dish.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Admin Flavr',
    email: 'admin@flavr.com',
    password: 'admin123',
    role: 'admin',
    language: 'english',
  });

  const user = await User.create({
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'user123',
    preferences: ['veg', 'spicy', 'high-protein'],
    allergies: ['peanuts'],
    language: 'english',
  });

  // ─── Coupons ─────────────────────────────────────
  await Coupon.create([
    { code: 'FLAVR50', discountType: 'percentage', discountValue: 50, maxDiscount: 200, minOrderAmount: 499, usageLimit: 50 },
    { code: 'WELCOME100', discountType: 'flat', discountValue: 100, minOrderAmount: 299, usageLimit: 100 },
    { code: 'FREEDEL', discountType: 'flat', discountValue: 50, minOrderAmount: 199, usageLimit: 200 },
  ]);

  // ─── Restaurants ─────────────────────────────────
  const r1 = await Restaurant.create({ name: 'Bombay Bistro', address: 'Andheri West, Mumbai', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600' });
  const r2 = await Restaurant.create({ name: 'Punjab Grill', address: 'Connaught Place, Delhi', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600' });
  const r3 = await Restaurant.create({ name: 'Coastal Kitchen', address: 'MG Road, Bangalore', imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600' });

  const m1 = await Menu.create({ restaurantId: r1._id, categories: ['Breakfast', 'Lunch', 'Dinner'] });
  const m2 = await Menu.create({ restaurantId: r2._id, categories: ['Lunch', 'Dinner'] });
  const m3 = await Menu.create({ restaurantId: r3._id, categories: ['Breakfast', 'Lunch', 'Dinner', 'Beverages'] });

  r1.menuId = m1._id; await r1.save();
  r2.menuId = m2._id; await r2.save();
  r3.menuId = m3._id; await r3.save();

  // ─── Dishes ──────────────────────────────────────
  const dishes = [
    { name: 'Masala Dosa', desc: 'Crispy rice crepe with potato filling served with chutneys', price: 149, cat: 'Breakfast', rest: r1._id, menu: m1._id, tags: ['veg', 'healthy'], rating: 4.5 },
    { name: 'Pav Bhaji', desc: 'Buttered bun with spiced mixed vegetable mash', price: 179, cat: 'Lunch', rest: r1._id, menu: m1._id, tags: ['veg', 'spicy'], rating: 4.3 },
    { name: 'Chicken Tikka', desc: 'Chargrilled marinated chicken pieces with mint chutney', price: 299, cat: 'Dinner', rest: r1._id, menu: m1._id, tags: ['non-veg', 'spicy', 'high-protein'], rating: 4.7 },
    { name: 'Vada Pav', desc: 'Mumbai style potato fritter sandwich', price: 49, cat: 'Breakfast', rest: r1._id, menu: m1._id, tags: ['veg'], rating: 4.1 },
    { name: 'Butter Chicken', desc: 'Creamy tomato-based chicken curry with butter', price: 349, cat: 'Dinner', rest: r1._id, menu: m1._id, tags: ['non-veg', 'high-protein'], rating: 4.8 },
    { name: 'Idli Sambar', desc: 'Steamed rice cakes with lentil soup', price: 99, cat: 'Breakfast', rest: r1._id, menu: m1._id, tags: ['veg', 'healthy'], rating: 4.2 },
    { name: 'Chole Bhature', desc: 'Spicy chickpea curry with fried bread', price: 199, cat: 'Lunch', rest: r1._id, menu: m1._id, tags: ['veg', 'spicy'], rating: 4.4 },
    { name: 'Biryani', desc: 'Hyderabadi dum biryani with tender chicken', price: 349, cat: 'Dinner', rest: r1._id, menu: m1._id, tags: ['non-veg', 'spicy', 'high-protein'], rating: 4.9 },
    { name: 'Rava Dosa', desc: 'Crispy semolina crepe with chutney', price: 129, cat: 'Breakfast', rest: r1._id, menu: m1._id, tags: ['veg'], rating: 4.2 },
    { name: 'Prawn Ghee Roast', desc: 'Crispy prawns roasted in ghee and special masala', price: 399, cat: 'Dinner', rest: r3._id, menu: m3._id, tags: ['non-veg', 'spicy'], rating: 4.8 },
    { name: 'Dal Makhani', desc: 'Slow cooked black lentils in rich creamy gravy', price: 249, cat: 'Lunch', rest: r2._id, menu: m2._id, tags: ['veg', 'healthy'], rating: 4.6 },
    { name: 'Tandoori Chicken', desc: 'Whole chicken marinated in yogurt and spices, clay oven baked', price: 399, cat: 'Dinner', rest: r2._id, menu: m2._id, tags: ['non-veg', 'high-protein'], rating: 4.9 },
    { name: 'Paneer Butter Masala', desc: 'Cottage cheese in creamy tomato gravy', price: 279, cat: 'Lunch', rest: r2._id, menu: m2._id, tags: ['veg', 'high-protein'], rating: 4.4 },
    { name: 'Naan Basket', desc: 'Assortment of butter naan, garlic naan, and roti', price: 149, cat: 'Lunch', rest: r2._id, menu: m2._id, tags: ['veg'], rating: 4.3 },
    { name: 'Rogan Josh', desc: 'Kashmiri lamb curry with aromatic spices', price: 449, cat: 'Dinner', rest: r2._id, menu: m2._id, tags: ['non-veg', 'spicy'], rating: 4.7 },
    { name: 'Kheer', desc: 'Traditional rice pudding with cardamom and nuts', price: 129, cat: 'Dinner', rest: r2._id, menu: m2._id, tags: ['veg', 'healthy'], rating: 4.5 },
    { name: 'Appam with Stew', desc: 'Lacy fermented rice pancake with vegetable stew', price: 199, cat: 'Breakfast', rest: r3._id, menu: m3._id, tags: ['veg', 'healthy'], rating: 4.3 },
    { name: 'Fish Curry Rice', desc: 'Tangy coconut fish curry served with steamed rice', price: 329, cat: 'Lunch', rest: r3._id, menu: m3._id, tags: ['non-veg', 'high-protein', 'healthy'], rating: 4.6 },
    { name: 'Coconut Water', desc: 'Fresh tender coconut water', price: 49, cat: 'Beverages', rest: r3._id, menu: m3._id, tags: ['veg', 'healthy'], rating: 4.0 },
    { name: 'Mango Lassi', desc: 'Chilled yogurt drink with alphonso mango pulp', price: 99, cat: 'Beverages', rest: r3._id, menu: m3._id, tags: ['veg'], rating: 4.4 },
    { name: 'Meen Pollichathu', desc: 'Kerala style banana leaf wrapped pearl spot fish', price: 449, cat: 'Dinner', rest: r3._id, menu: m3._id, tags: ['non-veg', 'healthy', 'high-protein'], rating: 4.9 },
    { name: 'Amritsari Kulcha', desc: 'Stuffed bread with chole and pickled onions', price: 179, cat: 'Lunch', rest: r2._id, menu: m2._id, tags: ['veg'], rating: 4.5 },
    { name: 'Shahi Paneer', desc: 'Royal paneer in rich nutty gravy', price: 299, cat: 'Dinner', rest: r2._id, menu: m2._id, tags: ['veg', 'high-protein'], rating: 4.6 },
    { name: 'Chicken Korma', desc: 'Mughlai style chicken in cashew cream sauce', price: 379, cat: 'Dinner', rest: r2._id, menu: m2._id, tags: ['non-veg'], rating: 4.4 },
    { name: 'Putu Mayam', desc: 'Steamed rice noodles with coconut and jaggery', price: 79, cat: 'Breakfast', rest: r3._id, menu: m3._id, tags: ['veg'], rating: 4.1 },
    { name: 'Squid Fry', desc: 'Crispy Kerala style squid rings', price: 299, cat: 'Dinner', rest: r3._id, menu: m3._id, tags: ['non-veg', 'spicy', 'high-protein'], rating: 4.5 },
    { name: 'Fresh Lime Soda', desc: 'Fresh lime juice with soda water', price: 39, cat: 'Beverages', rest: r3._id, menu: m3._id, tags: ['veg', 'healthy'], rating: 4.0 },
    { name: 'Malabar Parotta', desc: 'Flaky layered flatbread with salna', price: 89, cat: 'Lunch', rest: r3._id, menu: m3._id, tags: ['veg'], rating: 4.3 },
    { name: 'Ela Ada', desc: 'Steamed rice dumplings with sweet coconut filling', price: 69, cat: 'Breakfast', rest: r3._id, menu: m3._id, tags: ['veg', 'healthy'], rating: 4.2 },
    { name: 'Chicken Chettinad', desc: 'Fiery Chettinad style chicken curry', price: 349, cat: 'Dinner', rest: r3._id, menu: m3._id, tags: ['non-veg', 'spicy'], rating: 4.7 },
  ];

  await Dish.insertMany(dishes.map((d, i) => ({
    name: d.name,
    description: d.desc,
    price: d.price,
    category: d.cat,
    restaurant: d.rest,
    menu: d.menu,
    tags: d.tags,
    rating: d.rating,
    imageUrl: `https://images.unsplash.com/photo-${FOOD_IMAGES[i]}?w=800&h=600&fit=crop`,
    isAvailable: true,
  })));

  console.log(`✅ Flavr seeded!`);
  console.log(`   Admin: admin@flavr.com / admin123`);
  console.log(`   User: priya@example.com / user123`);
  console.log(`   ${dishes.length} dishes across 3 restaurants`);
  console.log(`   3 coupons: FLAVR50, WELCOME100, FREEDEL`);
  process.exit(0);
};

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
