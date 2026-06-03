const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  commentId: {
    type: String,
    unique: true,
    required: true,
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
