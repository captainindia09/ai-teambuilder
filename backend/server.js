require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ── Middleware ──
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── MongoDB ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/match', require('./routes/match'));
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/ai', require('./routes/aiAgent'));

// Health check
app.get('/', (req, res) => res.json({ status: 'TeamBuilder API running' }));

// ── Start ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
