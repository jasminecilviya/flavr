const Dish = require('../models/Dish');
const User = require('../models/User');
const getAIClient = require('../utils/aiClient');
const { asyncHandler } = require('../middlewares/errorMiddleware');

// POST /api/ai/recommend
exports.recommend = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  // LOGIC: Build context from available dishes + user preferences.
  // This gives the AI enough data to make personalized recommendations.
  const dishes = await Dish.find({ isAvailable: true })
    .populate('restaurant', 'name')
    .limit(30);

  const user = await User.findById(req.user._id);
  const preferences = user.preferences?.length
    ? `User preferences: ${user.preferences.join(', ')}`
    : 'No specific preferences set.';

  const menuContext = dishes
    .map(
      (d) =>
        `- ${d.name} (₹${d.price}) [${d.category}] from ${d.restaurant?.name || 'Unknown'} — ${d.tags?.join(', ') || 'no tags'} — Rating: ${d.rating}`
    )
    .join('\n');

  const systemPrompt = `You are FlavrAI, a nutritionist and chef. 
Available dishes:
${menuContext}

${preferences}

Recommend dishes based on the user's request. Explain *why* each recommendation fits.
Format response with dish names in **bold** and keep it conversational but concise.`;

  // Try AI provider, fall back to smart local matching
  const client = getAIClient();
  if (client) {
    try {
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 600,
        temperature: 0.7,
      });
      return res.json({ reply: completion.choices[0].message.content });
    } catch (err) {
      console.error('AI API error:', err.message);
      // Fall through to local matching
    }
  }

  // ponytail: local fallback when AI API is unavailable.
  // Does simple tag + category matching. Upgrade to embeddings if needed.
  const keywords = prompt.toLowerCase();
  const matched = dishes.filter(
    (d) =>
      d.tags.some((t) => keywords.includes(t)) ||
      d.category.toLowerCase().includes(keywords) ||
      d.name.toLowerCase().includes(keywords)
  );

  const top = matched.slice(0, 5);
  const reply = top.length
    ? `Based on "${prompt}", I recommend:\n${top
        .map((d) => `- **${d.name}** (₹${d.price}) — ${d.description.slice(0, 80)}`)
        .join('\n')}`
    : `Sorry, nothing matched "${prompt}". Try different keywords like "vegan", "spicy", or "breakfast".`;

  res.json({ reply, fallback: true });
});
