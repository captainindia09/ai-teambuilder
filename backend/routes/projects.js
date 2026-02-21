const router = require('express').Router();
const Project = require('../models/Project');
const auth = require('../middleware/authMiddleware');

// Get all open projects
router.get('/', auth, async (req, res) => {
  const { skill, domain, search } = req.query;
  let filter = {};

  if (skill) filter.skillsNeeded = { $in: [new RegExp(skill, 'i')] };
  if (domain && domain !== 'all') filter.domain = domain;
  if (search) filter.title = new RegExp(search, 'i');

  const projects = await Project.find(filter)
    .populate('creator', 'name skills')
    .populate('members.user', 'name skills')
    .sort({ createdAt: -1 });
  res.json(projects);
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('creator', 'name email skills')
    .populate('members.user', 'name skills bio');
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

// Create project
router.post('/', auth, async (req, res) => {
  const { title, description, skillsNeeded, domain, teamSize } = req.body;
  const skillsArr = typeof skillsNeeded === 'string'
    ? skillsNeeded.split(',').map(s => s.trim()).filter(Boolean)
    : (skillsNeeded || []);

  const project = await Project.create({
    title, description, domain,
    skillsNeeded: skillsArr,
    teamSize: parseInt(teamSize) || 4,
    creator: req.userId,
    members: [{ user: req.userId, role: 'lead', status: 'accepted' }]
  });

  res.status(201).json(project);
});

// Request to join
router.post('/:id/join', auth, async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const already = project.members.find(m => m.user.toString() === req.userId);
  if (already) return res.status(400).json({ error: 'Already requested or joined' });

  project.members.push({ user: req.userId, role: req.body.role || 'member', status: 'pending' });
  await project.save();
  res.json({ success: true });
});

// Accept member (creator only)
router.post('/:id/accept/:userId', auth, async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  if (project.creator.toString() !== req.userId) return res.status(403).json({ error: 'Not authorized' });

  const member = project.members.find(m => m.user.toString() === req.params.userId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  member.status = 'accepted';
  if (req.body.role) member.role = req.body.role;
  await project.save();
  res.json({ success: true });
});

// Reject member
router.post('/:id/reject/:userId', auth, async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  if (project.creator.toString() !== req.userId) return res.status(403).json({ error: 'Not authorized' });

  const member = project.members.find(m => m.user.toString() === req.params.userId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  member.status = 'rejected';
  await project.save();
  res.json({ success: true });
});

// Leave project
router.post('/:id/leave', auth, async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  project.members = project.members.filter(m => m.user.toString() !== req.userId);
  await project.save();
  res.json({ success: true });
});

// My projects (created + joined)
router.get('/user/mine', auth, async (req, res) => {
  const created = await Project.find({ creator: req.userId }).populate('members.user', 'name skills');
  const joined = await Project.find({ 'members.user': req.userId, creator: { $ne: req.userId } })
    .populate('creator', 'name').populate('members.user', 'name skills');
  res.json({ created, joined });
});

module.exports = router;
