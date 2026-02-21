const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matched: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  reason: { type: String, default: '' },
  suggestedRole: { type: String, default: '' },
  message: { type: String, default: '' },
  isAiDrafted: { type: Boolean, default: false },
  status: { type: String, enum: ['suggested', 'sent', 'accepted', 'rejected'], default: 'suggested' },
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
