const express = require('express');
const authRoutes = require('./authRoutes');
const issueRoutes = require('./issueRoutes');
const commentRoutes = require('./commentRoutes');
const { getHealth } = require('../controllers/issueController');

const router = express.Router();

// Welcome Route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Issue/Bug Tracker API. The backend is running successfully!"
  });
});

// Health Check API
router.get('/health', getHealth);

// Auth Routes
router.use('/auth', authRoutes);

// Issue Routes (includes /sync, /stats, /issues/*)
router.use('/', issueRoutes);

// User Routes
router.use('/users', require('./userRoutes'));

// Comment Routes
router.use('/comments', commentRoutes);

module.exports = router;
