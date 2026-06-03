const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const { successResponse, errorResponse } = require('../utils/standardResponse');

// POST /comments
exports.createComment = async (req, res) => {
  try {
    const { commentId, issueId, message } = req.body;

    if (!commentId || !issueId || !message) {
      return res.status(400).json(errorResponse('commentId, issueId, and message are required'));
    }

    // Verify issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json(errorResponse('Issue not found'));
    }

    const newComment = new Comment({ commentId, issueId, message });
    const savedComment = await newComment.save();

    res.status(201).json(successResponse('Comment added successfully', savedComment));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json(errorResponse('Comment with this commentId already exists'));
    }
    res.status(500).json(errorResponse(error.message));
  }
};

// GET /comments
exports.getAllComments = async (req, res) => {
  try {
    const { issueId } = req.query;
    const filter = {};
    if (issueId) filter.issueId = issueId;

    const comments = await Comment.find(filter).sort({ createdAt: -1 });
    res.json(successResponse('Comments fetched successfully', comments));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};
