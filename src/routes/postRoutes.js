const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Get all posts
router.get('/', postController.getPosts);

// Get single post
router.get('/:id', postController.getPost);

// Create post
router.post('/', postController.createPost);

// Update post
router.put('/:id', postController.updatePost);

// Delete post
router.delete('/:id', postController.deletePost);

module.exports = router; 