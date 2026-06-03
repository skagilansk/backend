const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  externalId: {
    type: String,
    unique: true, // Prevents duplicate insertions from external API
    sparse: true, // Allows documents without externalId
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
