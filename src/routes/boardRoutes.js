const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');

// Get all posts by subject
router.get('/subject/:subjectId', boardController.getPosts);

// Get posts by subject and type
router.get('/subject/:subjectId/:type', boardController.getPosts);

// Get single post
router.get('/:id', boardController.getPost);

// Create post
router.post('/', boardController.createPost);

// Update post
router.put('/:id', boardController.updatePost);

// Delete post
router.delete('/:id', boardController.deletePost);

module.exports = router; 