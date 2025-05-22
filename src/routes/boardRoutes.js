const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const multer = require('multer');
const path = require('path');

// uploads 폴더 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Get all posts by subject
router.get('/subject/:subjectId', boardController.getPosts);

// Get posts by subject and type
router.get('/subject/:subjectId/:type', boardController.getPosts);

// Get single post
router.get('/:id', boardController.getPost);

// Create post (여러 파일 첨부)
router.post('/', upload.array('files', 10), boardController.createPost);

// Update post (여러 파일 첨부)
router.put('/:id', upload.array('files', 10), boardController.updatePost);

// Delete post
router.delete('/:id', boardController.deletePost);

module.exports = router; 