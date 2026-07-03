const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { errorHandler } = require('./middlewares/errorMiddleware');

require('./models/User');
require('./models/Restaurant');
require('./models/Menu');
require('./models/Dish');
require('./models/Cart');
require('./models/Order');
require('./models/Favorite');
require('./models/Review');

const authRoutes = require('./routes/authRoutes');
const dishRoutes = require('./routes/dishRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: '🟢 Flavr API' }));
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);

// Serve frontend
const publicPaths = [
  path.join(__dirname, 'public'),
  path.join(process.cwd(), 'public'),
  '/app/public',
];
let publicDir = null;
for (const p of publicPaths) {
  if (fs.existsSync(p)) { publicDir = p; break; }
}
if (publicDir) {
  console.log('Serving static from:', publicDir);
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return;
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) res.sendFile(indexPath);
  });
}

app.use(errorHandler);
module.exports = app;
