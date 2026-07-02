const dotenv = require('dotenv');

// Override system env vars with .env — critical for OPENAI_BASE_URL etc.
dotenv.config({ override: true });

const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Flavr API: http://localhost:${PORT}`);
  });
});
