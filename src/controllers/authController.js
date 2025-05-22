const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password, name, department, studentId, phone } = req.body;
    if (!email || !password || !name || !department || !studentId || !phone) {
      return res.status(400).json({ message: '모든 필드를 입력하세요.' });
    }
    const exists = await User.findOne({ $or: [{ email }, { studentId }] });
    if (exists) {
      return res.status(409).json({ message: '이미 존재하는 이메일 또는 학번입니다.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, name, department, studentId, phone });
    await user.save();
    res.status(201).json({ message: '회원가입 성공' });
  } catch (e) {
    res.status(500).json({ message: '회원가입 실패', error: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { studentId, password } = req.body;
    if (!studentId || !password) {
      return res.status(400).json({ message: '학번과 비밀번호를 입력하세요.' });
    }
    const user = await User.findOne({ studentId });
    if (!user) {
      return res.status(401).json({ message: '존재하지 않는 학번입니다.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }
    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, studentId: user.studentId, isAdmin: user.isAdmin } });
  } catch (e) {
    res.status(500).json({ message: '로그인 실패', error: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: '내 정보 조회 실패', error: e.message });
  }
}; 