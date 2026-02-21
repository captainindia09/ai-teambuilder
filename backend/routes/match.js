const router = require('express').Router();
const User = require('../models/User');
const Match = require('../models/Match');
const auth = require('../middleware/authMiddleware');

// Find matches for a project based on skills needed
router.post('/find', auth, async (req, res) => {
  const { skillsNeeded, excludeIds } = req.body;
  const exclude = [req.userId, ...(excludeIds || [])];

  // Find users whose skills overlap with needed skills
  const users = await User.find({
    _id: { $nin: exclude },
    availability: 'available',
    skills: { $in: skillsNeeded.map(s => new RegExp(s, 'i')) }
  }).select('-password').limit(10);

  // Score each user by how many needed skills they have
  const scored = users.map(u => {
    const matchedSkills = u.skills.filter(s =>
      skillsNeeded.some(needed => s.toLowerCase().includes(needed.toLowerCase()))
    );
    return {
      user: u,
      matchedSkills,
      score: matchedSkills.length
    };
  }).sort((a, b) => b.score - a.score);

  res.json(scored);
});

// Get messages / matches for current user
router.get('/my-messages', auth, async (req, res) => {
  const received = await Match.find({ matched: req.userId, status: 'sent' })
    .populate('requester', 'name skills')
    .populate('project', 'title')
    .sort({ createdAt: -1 });
  const sent = await Match.find({ requester: req.userId })
    .populate('matched', 'name skills')
    .populate('project', 'title')
    .sort({ createdAt: -1 });
  res.json({ received, sent });
});

// Send a message/invite
router.post('/send', auth, async (req, res) => {
  const { matchedId, projectId, message, suggestedRole, reason, isAiDrafted } = req.body;

  const match = await Match.create({
    requester: req.userId,
    matched: matchedId,
    project: projectId || null,
    message, suggestedRole, reason,
    isAiDrafted: isAiDrafted || false,
    status: 'sent'
  });

  res.status(201).json(match);
});

module.exports = router;
