const OpenAI = require('openai');

// LOGIC: Factory that creates an OpenAI-compatible client.
// The OPENAI_BASE_URL env var lets us plug any OpenAI-compatible provider
// (Mistral, Groq, Together, etc.) without changing code.
const getAIClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  });
};

module.exports = getAIClient;
