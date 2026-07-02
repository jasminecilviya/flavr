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
  origin: process.env.CLIENT_URL || 'https://flavr-app.vercel.app',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public health check (no OIDC required)
app.get('/api/health', (req, res) => res.json({ status: '🟢 Flavr API running' }));

// LOGIC: OIDC Federation protects all other API routes in production.
// The frontend proxy injects x-vercel-oidc-token header.
// In dev mode (NODE_ENV=development), OIDC check is skipped by the middleware.
app.use('/api', oidcProtect);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
