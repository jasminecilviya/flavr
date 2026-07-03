const Dish = require('../models/Dish');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const getAIClient = require('../utils/aiClient');
const { asyncHandler } = require('../middlewares/errorMiddleware');

// POST /api/ai/recommend — multi-turn with history
exports.recommend = asyncHandler(async (req, res) => {
  const { prompt, history } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  const user = await User.findById(req.user._id);
  const dishes = await Dish.find({ isAvailable: true })
    .populate('restaurant', 'name')
    .limit(30);
  const orders = await Order.find({ user: req.user._id })
    .populate('items.dish', 'name')
    .sort('-createdAt')
    .limit(5);

  // LOGIC: Build rich user context — preferences, past orders, ratings
  const prefText = user.preferences?.length
    ? `User preferences: ${user.preferences.join(', ')}`
    : 'No preferences set';

  const orderHistory = orders.length
    ? 'Past orders: ' + orders.map(o =>
        o.items.map(i => i.dish?.name).join(', ')
      ).join(' | ')
    : 'No past orders';

  // LOGIC: Extract budget from prompt using simple regex
  const budgetMatch = prompt.match(/under\s*₹?(\d+)|₹?(\d+)\s*budget|less than\s*₹?(\d+)/i);
  const budget = budgetMatch ? parseInt(budgetMatch[1] || budgetMatch[2] || budgetMatch[3]) : null;

  const menuContext = dishes.map(d =>
    `- ${d.name} (₹${d.price}) [${d.category}] @ ${d.restaurant?.name || 'Unknown'} — ${d.tags?.join(', ') || ''} — ⭐${d.rating}`
  ).join('\n');

  const systemPrompt = `You are FlavrAI, a world-class chef and nutritionist for the Flavr platform.

## Context
Available dishes:
${menuContext}

## User Profile
${prefText}
${orderHistory}
${budget ? `User budget: ₹${budget}` : 'No specific budget mentioned'}

## Rules
1. Recommend 2-4 dishes that match their request
2. Explain *why* each dish fits — mention taste, nutrition, value
3. If they mention a budget, only recommend dishes within that price
4. Use **bold** for dish names
5. End with 3 follow-up questions in this format:
   💬 **Try asking:** "question 1" • "question 2" • "question 3"
6. Be conversational, warm, and specific — no generic advice`;

  // LOGIC: Build message history for multi-turn conversation
  const messages = [
    { role: 'system', content: systemPrompt },
  ];

  // Add last 4 exchanges from history (limited for token efficiency)
  if (Array.isArray(history)) {
    const recent = history.slice(-8); // last 4 exchanges = 8 messages
    recent.forEach(h => {
      messages.push({ role: 'user', content: h.user });
      messages.push({ role: 'assistant', content: h.ai });
    });
  }

  messages.push({ role: 'user', content: prompt });

  const client = getAIClient();
  if (client) {
    try {
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'mistral-small-latest',
        messages,
        max_tokens: 800,
        temperature: 0.7,
      });
      return res.json({ reply: completion.choices[0].message.content });
    } catch (err) {
      console.error('AI API error:', err.message);
    }
  }

  // ponytail: smart local matching with budget + preference awareness
  const keywords = prompt.toLowerCase();
  let matched = dishes.filter(d =>
    d.tags.some(t => keywords.includes(t)) ||
    d.category.toLowerCase().includes(keywords) ||
    d.name.toLowerCase().includes(keywords)
  );

  // Budget filter
  if (budget) matched = matched.filter(d => d.price <= budget);

  // Preference boost — sort by matching user preferences
  if (user.preferences?.length) {
    matched.sort((a, b) => {
      const aScore = a.tags.filter(t => user.preferences.includes(t)).length;
      const bScore = b.tags.filter(t => user.preferences.includes(t)).length;
      return bScore - aScore || b.rating - a.rating;
    });
  }

  const top = matched.slice(0, 4);
  if (top.length) {
    const reply = `Based on "${prompt}", here are my picks:\n\n${top.map(d =>
      `- **${d.name}** (₹${d.price}) ⭐${d.rating} — ${d.description.slice(0, 100)}`
    ).join('\n')}\n\n💬 **Try asking:** "Compare these" • "Suggest sides" • "What drink pairs well?"`;
    return res.json({ reply, fallback: true });
  }

  res.json({
    reply: `I couldn't find exact matches for "${prompt}". Try something like "vegetarian lunch under ₹300" or "spicy chicken dinner".`,
    fallback: true,
  });
});

// POST /api/ai/chat — quick conversational (no menu context, general food chat)
exports.chat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  const client = getAIClient();
  if (!client) return res.json({ reply: "I'm your AI chef assistant! Ask me about recipes, nutrition, or what to cook today." });

  const messages = [
    { role: 'system', content: 'You are FlavrAI, a friendly chef and nutritionist. You give short, practical food advice. Keep responses under 3 sentences unless asked for details.' },
  ];

  if (Array.isArray(history)) {
    history.slice(-6).forEach(h => {
      messages.push({ role: 'user', content: h.user });
      messages.push({ role: 'assistant', content: h.ai });
    });
  }

  messages.push({ role: 'user', content: message });

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'mistral-small-latest',
      messages,
      max_tokens: 400,
      temperature: 0.8,
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch {
    res.json({ reply: "I'm here! Ask me anything about food, recipes, or nutrition." });
  }
});
