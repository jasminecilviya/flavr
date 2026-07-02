const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorMiddleware');

// LOGIC: Register all Mongoose models upfront so populate() works everywhere.
require('./models/User');
require('./models/Restaurant');
require('./models/Menu');
require('./models/Dish');
require('./models/Cart');
require('./models/Order');

const authRoutes = require('./routes/authRoutes');
const dishRoutes = require('./routes/dishRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

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
app.use(errorHandler);

module.exports = app;
