const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashed = await bcrypt.hash('minwoo6713', 10);
  const admin = new User({
    email: 'admin@example.com',
    password: hashed,
    name: '관리자',
    department: '컴퓨터학부',
    studentId: '20192576',
    phone: '010-0000-0000',
    isAdmin: true
  });
  try {
    await admin.save();
    console.log('Admin user created');
  } catch (e) {
    console.error('Admin user creation failed:', e.message);
  } finally {
    await mongoose.disconnect();
  }
}
createAdmin(); 