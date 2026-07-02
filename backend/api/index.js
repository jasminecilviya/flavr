// LOGIC: Vercel serverless entry point.
// Wraps Express app with serverless-http so it works as a Vercel function.
const serverless = require('serverless-http');
const app = require('../app');

// Override dotenv for Vercel environment (uses Vercel env vars)
if (process.env.VERCEL) {
  // Vercel injects env vars natively — no .env needed
} else {
  require('dotenv').config({ override: true });
}

module.exports = serverless(app);
