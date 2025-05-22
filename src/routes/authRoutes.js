const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// 회원가입
router.post('/register', authController.register);
// 로그인
router.post('/login', authController.login);
// 내 정보
router.get('/me', authMiddleware, authController.me);

module.exports = router; 