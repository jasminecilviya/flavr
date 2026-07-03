const Dish = require('../models/Dish');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const getAIClient = require('../utils/aiClient');
const { asyncHandler } = require('../middlewares/errorMiddleware');

// ─── LANGUAGE PROFILES ──────────────────────────
const LANGUAGES = {
  hindi: {
    name: 'हिन्दी',
    systemSuffix: 'IMPORTANT: Respond in HINDI (Devanagari script). Use Hinglish only for dish names.',
    greeting: 'नमस्ते! मैं FlavrAI हूँ। आपको क्या खाने का मन है?',
  },
  tamil: {
    name: 'தமிழ்',
    systemSuffix: 'IMPORTANT: Respond in TAMIL (Tamil script). Use English only for dish names.',
    greeting: 'வணக்கம்! நான் FlavrAI. உங்களுக்கு என்ன சாப்பிட வேண்டும் போல் இருக்கிறது?',
  },
  english: {
    name: 'English',
    systemSuffix: '',
    greeting: "Hey! I'm FlavrAI 🍽️ Your personal chef and nutritionist.",
  },
};

// ─── BUILD USER CONTEXT ─────────────────────────
async function buildContext(userId) {
  const user = await User.findById(userId);
  const dishes = await Dish.find({ isAvailable: true })
    .populate('restaurant', 'name')
    .limit(50);
  const orders = await Order.find({ user: userId })
    .populate('items.dish', 'name price')
    .sort('-createdAt')
    .limit(5);

  const prefText = user?.preferences?.length
    ? `User preferences: ${user.preferences.join(', ')}`
    : 'No preferences set';

  const allergies = user?.allergies?.length
    ? `Allergies: ${user.allergies.join(', ')}`
    : 'No allergies listed';

  const orderHistory = orders.length
    ? 'Past orders: ' + orders.map(o =>
        o.items.map(i => i.dish?.name).join(', ')
      ).join(' | ')
    : 'No past orders';

  const menuContext = dishes.map(d =>
    `- ${d.name} (₹${d.price}) [${d.category}] @ ${d.restaurant?.name || 'Unknown'} — ${d.tags?.join(', ') || ''} — ⭐${d.rating}`
  ).join('\n');

  return { user, dishes, prefText, allergies, orderHistory, menuContext };
}

// ─── EXTRACT BUDGET ─────────────────────────────
function extractBudget(prompt) {
  const match = prompt.match(/under\s*₹?(\d+)|₹?(\d+)\s*budget|less than\s*₹?(\d+)|budget\s*₹?(\d+)/i);
  return match ? parseInt(match[1] || match[2] || match[3] || match[4]) : null;
}

// ─── SYSTEM PROMPT BUILDER ──────────────────────
function buildSystemPrompt(ctx, budget, language) {
  const lang = LANGUAGES[language] || LANGUAGES.english;
  return `You are FlavrAI, a world-class chef, nutritionist, and food consultant for the Flavr platform.

## Available Menu
${ctx.menuContext}

## User Profile
${ctx.prefText}
${ctx.allergies}
${ctx.orderHistory}
${budget ? `Budget: ₹${budget}` : 'No budget mentioned'}

## Core Rules
1. Recommend 2-4 dishes with specific reasoning — taste, nutrition, value
2. Use **bold** for dish names and ₹ for prices
3. If budget given, ONLY recommend dishes within that range
4. Be conversational, warm, and specific — no generic fluff
5. End with 3 follow-up questions in this format:
   💬 **Try asking:** "question 1" • "question 2" • "question 3"
6. Consider user preferences, allergies, and order history for personalization
7. Suggest pairings (drinks, sides) when appropriate

${lang.systemSuffix}`;
}

function buildChatSystemPrompt(language) {
  const lang = LANGUAGES[language] || LANGUAGES.english;
  return `You are FlavrAI, a friendly chef and nutritionist. Give short, practical food advice. Keep responses under 3 sentences unless asked for details.

Recipe tips, cooking techniques, nutrition facts, and food trivia are all welcome.

${lang.systemSuffix}`;
}

// ─── AI COMPLETION HELPER ───────────────────────
async function getAIResponse(messages, options = {}) {
  const client = getAIClient();
  if (!client) return null;

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'mistral-small-latest',
      messages,
      max_tokens: options.maxTokens || 800,
      temperature: options.temperature || 0.7,
    });
    return completion.choices[0].message.content;
  } catch (err) {
    console.error('AI API error:', err.message);
    return null;
  }
}

// ─── LOCAL FALLBACK ─────────────────────────────
function localFallback(prompt, dishes, budget, preferences) {
  const keywords = prompt.toLowerCase();
  let matched = dishes.filter(d =>
    d.tags?.some(t => keywords.includes(t)) ||
    d.category?.toLowerCase().includes(keywords) ||
    d.name?.toLowerCase().includes(keywords)
  );

  if (budget) matched = matched.filter(d => d.price <= budget);

  if (preferences?.length) {
    matched.sort((a, b) => {
      const aScore = a.tags?.filter(t => preferences.includes(t)).length || 0;
      const bScore = b.tags?.filter(t => preferences.includes(t)).length || 0;
      return bScore - aScore || b.rating - a.rating;
    });
  }

  const top = matched.slice(0, 4);
  if (top.length) {
    return `Here are my picks based on "${prompt}":\n\n${top.map((d, i) =>
      `**${d.name}** (₹${d.price}) ⭐${d.rating} — ${d.description.slice(0, 120)}`
    ).join('\n')}\n\n💬 **Try asking:** "Which is healthier?" • "Suggest a drink pairing" • "Compare these two"`;
  }
  return null;
}

// ─── POST /api/ai/recommend ─────────────────────
exports.recommend = asyncHandler(async (req, res) => {
  const { prompt, history, language } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  const ctx = await buildContext(req.user._id);
  const budget = extractBudget(prompt);

  const systemPrompt = buildSystemPrompt(ctx, budget, language);
  const messages = [{ role: 'system', content: systemPrompt }];

  if (Array.isArray(history)) {
    const recent = history.slice(-8);
    recent.forEach(h => {
      if (h.user) messages.push({ role: 'user', content: h.user });
      if (h.ai) messages.push({ role: 'assistant', content: h.ai });
    });
  }

  messages.push({ role: 'user', content: prompt });

  let reply = await getAIResponse(messages);
  if (reply) return res.json({ reply });

  const fallback = localFallback(prompt, ctx.dishes, budget, ctx.user?.preferences);
  if (fallback) return res.json({ reply: fallback, fallback: true });

  const langGuide = language && language !== 'english' ? ` (${LANGUAGES[language]?.name || language} available if you prefer!)` : '';
  res.json({
    reply: `I couldn't find exact matches for "${prompt}". Try something like "vegetarian lunch under ₹300" or "spicy chicken dinner".${langGuide}`,
    fallback: true,
  });
});

// ─── POST /api/ai/chat ──────────────────────────
exports.chat = asyncHandler(async (req, res) => {
  const { message, history, language } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  const systemPrompt = buildChatSystemPrompt(language);
  const messages = [{ role: 'system', content: systemPrompt }];

  if (Array.isArray(history)) {
    history.slice(-6).forEach(h => {
      if (h.user) messages.push({ role: 'user', content: h.user });
      if (h.ai) messages.push({ role: 'assistant', content: h.ai });
    });
  }

  messages.push({ role: 'user', content: message });

  const reply = await getAIResponse(messages, { maxTokens: 400, temperature: 0.8 });
  res.json({ reply: reply || "I'm here! Ask me anything about food, recipes, or nutrition." });
});

// ─── POST /api/ai/stream — SSE STREAMING ───────
exports.stream = asyncHandler(async (req, res) => {
  const { prompt, history, language } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  const ctx = await buildContext(req.user._id);
  const budget = extractBudget(prompt);
  const systemPrompt = buildSystemPrompt(ctx, budget, language);

  const messages = [{ role: 'system', content: systemPrompt }];
  if (Array.isArray(history)) {
    history.slice(-8).forEach(h => {
      if (h.user) messages.push({ role: 'user', content: h.user });
      if (h.ai) messages.push({ role: 'assistant', content: h.ai });
    });
  }
  messages.push({ role: 'user', content: prompt });

  const client = getAIClient();
  if (!client) {
    const fallback = localFallback(prompt, ctx.dishes, budget, ctx.user?.preferences);
    return res.json({
      reply: fallback || 'Could not connect to AI. Please try again.',
      fallback: true,
    });
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const stream = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'mistral-small-latest',
      messages,
      max_tokens: 800,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        // SSE format: "data: <text>\n\n"
        res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error('SSE stream error:', err.message);
    // Fallback to non-streaming
    const reply = await getAIResponse(messages);
    res.write(`data: ${JSON.stringify({ text: reply || 'Sorry, I encountered an error.' })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
});

// ─── POST /api/ai/meal-plan ─────────────────────
exports.mealPlan = asyncHandler(async (req, res) => {
  const { preferences, days = 3 } = req.body;
  const user = await User.findById(req.user._id);
  const dishes = await Dish.find({ isAvailable: true })
    .populate('restaurant', 'name')
    .limit(50);

  const prefText = user?.preferences?.length
    ? user.preferences.join(', ')
    : (preferences?.join(', ') || 'any');

  const menuList = dishes.map(d =>
    `- ${d.name} (₹${d.price}) [${d.category}] ⭐${d.rating} — ${d.tags?.join(', ') || ''}`
  ).join('\n');

  const systemPrompt = `You are FlavrAI Meal Planner. Create a ${days}-day meal plan.

Available dishes:
${menuList}

User preferences: ${prefText}

Rules:
1. Recommend breakfast, lunch, dinner for each day
2. Use **dish names** from the available menu
3. Include variety — don't repeat dishes
4. Tag meals with 🥗 (healthy), 🔥 (spicy), 💪 (protein), 🌿 (vegan)
5. End with a grocery essentials list
6. Format as a clean table using markdown`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Create a ${days}-day meal plan for someone who likes ${prefText}` },
  ];

  const reply = await getAIResponse(messages, { maxTokens: 1200, temperature: 0.6 });
  res.json({ plan: reply || 'Could not generate meal plan. Try again.' });
});
