const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');

// uploads 폴더 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    // 파일명에 한글이 포함되어 있어도 그대로 사용
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // 원본 파일명을 그대로 사용하되, 타임스탬프와 랜덤값을 앞에 추가
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// activityPhoto(1개), files(최대 10개)만 허용
const uploadFields = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // 파일명에 한글이 포함되어 있어도 허용
    cb(null, true);
  }
}).fields([
  { name: 'activityPhoto', maxCount: 1 },
  { name: 'files', maxCount: 10 }
]);

// Get all posts by subject
router.get('/subject/:subjectId', boardController.getPosts);

// Get posts by subject and type
router.get('/subject/:subjectId/:type', boardController.getPosts);

// Get single post
router.get('/:id', boardController.getPost);

// Create post (activityPhoto 또는 files만 허용)
router.post('/', authMiddleware, uploadFields, boardController.createPost);

// Update post (activityPhoto 또는 files만 허용)
router.put('/:id', authMiddleware, uploadFields, boardController.updatePost);

// Delete post
router.delete('/:id', authMiddleware, boardController.deletePost);

module.exports = router; 