const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  college: { type: String, default: '' },
  year: { type: Number, default: 1 },
  skills: [String],
  availability: { type: String, enum: ['available', 'busy', 'in-team'], default: 'available' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  aiScore: { type: Number, default: 0 },
  questionsAnswered: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
