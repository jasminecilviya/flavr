const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { asyncHandler } = require('../middlewares/errorMiddleware');

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });

  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferences: user.preferences,
    allergies: user.allergies,
    language: user.language,
    token: generateToken(user),
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferences: user.preferences,
    allergies: user.allergies,
    language: user.language,
    token: generateToken(user),
  });
});

// GET /api/auth/profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
});

// PUT /api/auth/profile — update preferences, allergies, language (for AI context)
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      preferences: req.body.preferences,
      allergies: req.body.allergies,
      language: req.body.language,
    },
    { new: true }
  );
  res.json(user);
});
