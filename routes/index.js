const express = require('express');
const authRoutes = require('./authRoutes');
const issueRoutes = require('./issueRoutes');
const commentRoutes = require('./commentRoutes');
const { getHealth } = require('../controllers/issueController');

const router = express.Router();

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
