const serverless = require('serverless-http');
const app = require('../app');

// LOGIC: Vercel serverless entry point.
// Exports Express app wrapped with serverless-http.
// Vercel expects module.exports for @vercel/node runtime.
module.exports = serverless(app);
