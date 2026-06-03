const express = require('express');
const { createComment, getAllComments } = require('../controllers/commentController');

const router = express.Router();

router.post('/', createComment);
router.get('/', getAllComments);

module.exports = router;
