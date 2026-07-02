require('dotenv').config({ override: true });
const connectDB = require('./config/db');
const app = require('./app');

// LOGIC: Railway sets PORT env var automatically. Express listens on it.
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Flavr API: http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect DB:', err.message);
    // Keep server alive even if DB fails — healthcheck will catch it
    app.listen(PORT, () => {
      console.log(`Flavr API (no DB): http://0.0.0.0:${PORT}`);
    });
  });
