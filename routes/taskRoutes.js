const express = require('express');
const {
  syncTasks,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getStats,
  searchTasks
} = require('../controllers/taskController');

const router = express.Router();

router.post('/sync', syncTasks);
router.get('/stats', getStats);
router.get('/tasks/search', searchTasks);
router.get('/tasks', getAllTasks);
router.get('/tasks/:id', getTaskById);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

module.exports = router;
