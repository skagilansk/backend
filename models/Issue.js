const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  issueId: {
    type: String,
    unique: true,
    sparse: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'closed'],
    default: 'open',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  assignee: {
    type: String,
    trim: true,
    default: '',
  },
  reporter: {
    type: String,
    trim: true,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
