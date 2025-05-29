// Board 컬렉션의 author(이름)를 studentId로 일괄 변경하는 마이그레이션 스크립트
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../src/models/User');
const Board = require('../src/models/Board');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('DB connected');

  // 모든 Board 문서 조회
  const boards = await Board.find({});
  let updated = 0;

  for (const board of boards) {
    // author가 한글(이름)이고, 해당 이름의 user가 있으면 studentId로 변경
    if (/^[가-힣]+$/.test(board.author)) {
      const user = await User.findOne({ name: board.author });
      if (user && user.studentId) {
        board.author = user.studentId;
        await board.save();
        updated++;
        console.log(`Updated board ${board._id}: author -> ${user.studentId}`);
      }
    }
  }
  console.log(`Migration complete. Updated ${updated} boards.`);
  mongoose.disconnect();
}

migrate(); 