const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Get current user profile
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Update profile
router.put('/me', auth, async (req, res) => {
  const { name, bio, college, year, skills, github, linkedin, availability } = req.body;
  const skillsArr = typeof skills === 'string'
    ? skills.split(',').map(s => s.trim()).filter(Boolean)
    : (skills || []);

  const user = await User.findByIdAndUpdate(req.userId, {
    name, bio, college, year: parseInt(year) || 1,
    skills: skillsArr, github, linkedin, availability
  }, { new: true }).select('-password');

  res.json(user);
});

// Browse all available users
router.get('/', auth, async (req, res) => {
  const { skill, search } = req.query;
  let filter = { _id: { $ne: req.userId } };

  if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };
  if (search) filter.name = new RegExp(search, 'i');

  const users = await User.find(filter).sort({ createdAt: -1 }).select('-password').limit(30);
  res.json(users);
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
