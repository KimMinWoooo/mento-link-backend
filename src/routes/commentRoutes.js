const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

// Get comments for a board
router.get('/board/:boardId', commentController.getComments);

// Create comment
router.post('/board/:boardId', authMiddleware, commentController.createComment);

// Update comment
router.put('/:id', authMiddleware, commentController.updateComment);

// Delete comment
router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router; 