const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorMiddleware');
const oidcProtect = require('./middlewares/oidcMiddleware');

const authRoutes = require('./routes/authRoutes');
const dishRoutes = require('./routes/dishRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check always public
app.get('/api/health', (req, res) => res.json({ status: '🟢 Flavr API running' }));

// LOGIC: OIDC verification in production only.
// The frontend proxy function injects x-vercel-oidc-token.
// In dev (NODE_ENV=development), middleware skips verification.
app.use('/api', oidcProtect);

app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

module.exports = app;
