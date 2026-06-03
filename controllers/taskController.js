const Task = require('../models/Task');
const { fetchExternalData } = require('../services/externalApiService');
const { successResponse, errorResponse } = require('../utils/standardResponse');
const mongoose = require('mongoose');

// GET /health
exports.getHealth = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1 ? 'connected' : 'disconnected';
    const documentCount = await Task.countDocuments();
    
    res.json({
      success: true,
      database: isConnected,
      documentCount: documentCount
    });
  } catch (error) {
    res.status(500).json(errorResponse('Health check failed: ' + error.message));
  }
};

// POST /sync
exports.syncTasks = async (req, res) => {
  try {
    const { token } = req.body; // Expect token from client or get via API
    
    // Fetch data
    const data = await fetchExternalData(token);
    
    if (!Array.isArray(data)) {
      return res.status(400).json(errorResponse('Invalid dataset format received'));
    }

    let inserted = 0;
    let duplicates = 0;
    let rejected = 0;

    for (const item of data) {
      // Validate and sanitize
      if (!item.title || item.title.trim() === '') {
        rejected++;
        continue;
      }
      
      const status = ['pending', 'completed'].includes(item.status) ? item.status : 'pending';
      const priority = ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium';

      try {
        const newTask = new Task({
          title: item.title.trim(),
          description: item.description ? item.description.trim() : '',
          status,
          priority,
          externalId: item.id || null
        });
        await newTask.save();
        inserted++;
      } catch (err) {
        if (err.code === 11000) { // Duplicate key error
          duplicates++;
        } else {
          rejected++;
        }
      }
    }

    res.json({
      success: true,
      totalFetched: data.length,
      inserted,
      duplicates,
      rejected
    });

  } catch (error) {
    res.status(500).json(errorResponse('Sync failed: ' + error.message));
  }
};

// GET /tasks
exports.getAllTasks = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(successResponse('Tasks fetched successfully', tasks));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// GET /tasks/search?q=...
exports.searchTasks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json(errorResponse('Search query "q" is required'));
    }
    const tasks = await Task.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(successResponse('Search results', tasks));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// GET /tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json(errorResponse('Task not found'));
    res.json(successResponse('Task fetched', task));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// POST /tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;
    if (!title) return res.status(400).json(errorResponse('Title is required'));

    const newTask = new Task({ title, description, status, priority });
    const savedTask = await newTask.save();
    res.status(201).json(successResponse('Task created successfully', savedTask));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// PUT /tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTask) return res.status(404).json(errorResponse('Task not found'));
    res.json(successResponse('Task updated successfully', updatedTask));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// DELETE /tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json(errorResponse('Task not found'));
    res.json(successResponse('Task deleted successfully'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// GET /stats
exports.getStats = async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const completed = await Task.countDocuments({ status: 'completed' });
    const pending = await Task.countDocuments({ status: 'pending' });
    
    const priorityGroups = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const formattedPriority = {
      low: 0, medium: 0, high: 0
    };
    priorityGroups.forEach(g => {
      if (g._id) formattedPriority[g._id] = g.count;
    });

    res.json(successResponse('Stats computed', {
      totalRecords: total,
      completedRecords: completed,
      pendingRecords: pending,
      priorityGrouping: formattedPriority
    }));
  } catch (error) {
    res.status(500).json(errorResponse('Failed to fetch stats: ' + error.message));
  }
};
