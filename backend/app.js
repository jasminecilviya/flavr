const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { errorHandler } = require('./middlewares/errorMiddleware');

// Register all models upfront for populate()
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

// API Routes
app.get('/api/health', (req, res) => res.json({ status: '🟢 Flavr API' }));
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// LOGIC: Serve built frontend from /public
// Try multiple possible paths for Railway vs local dev
const publicPaths = [
  path.join(__dirname, 'public'),
  path.join(process.cwd(), 'public'),
  '/app/public',
];

let publicDir = null;
for (const p of publicPaths) {
  if (fs.existsSync(p)) {
    publicDir = p;
    break;
  }
}

if (publicDir) {
  console.log('Serving static from:', publicDir);
  app.use(express.static(publicDir));
  
  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return;
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Flavr — Taste the Future</title><script type="module" crossorigin src="/assets/index-DjL4TEgS.js"></script><link rel="stylesheet" crossorigin href="/assets/index-Cdm0cXPW.css"></head><body><div id="root"></div></body></html>`);
    }
  });
} else {
  console.log('WARNING: No public directory found. Frontend not served.');
}

app.use(errorHandler);

module.exports = app;
