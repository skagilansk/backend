const Issue = require('../models/Issue');
const { fetchExternalData } = require('../services/externalApiService');
const { successResponse, errorResponse } = require('../utils/standardResponse');
const mongoose = require('mongoose');

// GET /health
exports.getHealth = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1 ? 'connected' : 'disconnected';
    const documentCount = await Issue.countDocuments();

    res.json(successResponse('Database connected successfully', {
      database: isConnected,
      documentCount: documentCount,
    }));
  } catch (error) {
    res.status(500).json(errorResponse('Health check failed: ' + error.message));
  }
};

// POST /sync
exports.syncIssues = async (req, res) => {
  try {
    const { token } = req.body;

    // Use provided token or try to get one from external API
    const data = await fetchExternalData(token);

    if (!Array.isArray(data)) {
      return res.status(400).json(errorResponse('Invalid dataset format received'));
    }

    let inserted = 0;
    let duplicates = 0;
    let rejected = 0;

    for (const item of data) {
      // Validate: must have title
      if (!item.title || String(item.title).trim() === '') {
        rejected++;
        continue;
      }

      // Sanitize and normalize
      const validStatuses = ['open', 'in-progress', 'closed'];
      const validPriorities = ['low', 'medium', 'high', 'critical'];

      const status = validStatuses.includes(item.status) ? item.status : 'open';
      const priority = validPriorities.includes(item.priority) ? item.priority : 'medium';

      try {
        const newIssue = new Issue({
          issueId: item.issueId || item.id || null,
          title: String(item.title).trim(),
          description: item.description ? String(item.description).trim() : '',
          status,
          priority,
          assignee: item.assignee ? String(item.assignee).trim() : '',
          reporter: item.reporter ? String(item.reporter).trim() : '',
          tags: Array.isArray(item.tags) ? item.tags.map(t => String(t).trim()) : [],
        });
        await newIssue.save();
        inserted++;
      } catch (err) {
        if (err.code === 11000) {
          duplicates++;
        } else {
          rejected++;
        }
      }
    }

    res.json(successResponse('Dataset synchronized successfully', {
      totalFetched: data.length,
      inserted,
      duplicates,
      rejected,
    }));
  } catch (error) {
    res.status(500).json(errorResponse('Sync failed: ' + error.message));
  }
};

// GET /issues
exports.getAllIssues = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      message: 'Data fetched successfully',
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      data: issues,
    });
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// GET /issues/search?q=...
exports.searchIssues = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json(errorResponse('Search query "q" is required'));
    }
    const issues = await Issue.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    });
    res.json(successResponse('Search results', issues));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// GET /issues/:id
exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json(errorResponse('Issue not found'));
    res.json(successResponse('Issue fetched', issue));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// POST /issues
exports.createIssue = async (req, res) => {
  try {
    const { title, description, status, priority, assignee, reporter, tags } = req.body;
    if (!title) return res.status(400).json(errorResponse('Title is required'));

    const newIssue = new Issue({ title, description, status, priority, assignee, reporter, tags });
    const savedIssue = await newIssue.save();
    res.status(201).json(successResponse('Issue created successfully', savedIssue));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// PUT /issues/:id
exports.updateIssue = async (req, res) => {
  try {
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedIssue) return res.status(404).json(errorResponse('Issue not found'));
    res.json(successResponse('Issue updated successfully', updatedIssue));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// DELETE /issues/:id
exports.deleteIssue = async (req, res) => {
  try {
    const deletedIssue = await Issue.findByIdAndDelete(req.params.id);
    if (!deletedIssue) return res.status(404).json(errorResponse('Issue not found'));
    res.json(successResponse('Issue deleted successfully'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// GET /stats
exports.getStats = async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const open = await Issue.countDocuments({ status: 'open' });
    const inProgress = await Issue.countDocuments({ status: 'in-progress' });
    const closed = await Issue.countDocuments({ status: 'closed' });

    const priorityGroups = await Issue.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const formattedPriority = { low: 0, medium: 0, high: 0, critical: 0 };
    priorityGroups.forEach(g => {
      if (g._id) formattedPriority[g._id] = g.count;
    });

    res.json(successResponse('Stats computed', {
      totalRecords: total,
      openRecords: open,
      inProgressRecords: inProgress,
      closedRecords: closed,
      priorityGrouping: formattedPriority,
    }));
  } catch (error) {
    res.status(500).json(errorResponse('Failed to fetch stats: ' + error.message));
  }
};
