const express = require('express');
const {
  syncIssues,
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  getStats,
  searchIssues,
} = require('../controllers/issueController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/sync', authenticate, authorize('admin', 'manager'), syncIssues);
router.get('/stats', getStats);
router.get('/issues/search', searchIssues);
router.get('/issues', getAllIssues);
router.get('/issues/:id', getIssueById);
router.post('/issues', createIssue);
router.put('/issues/:id', updateIssue);
router.delete('/issues/:id', deleteIssue);

module.exports = router;
