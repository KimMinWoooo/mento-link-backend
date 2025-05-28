const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Cohort = require('../models/Cohort');
const Subject = require('../models/Subject');
const Board = require('../models/Board');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample data
const sampleData = {
  users: [
    {
      email: 'admin@ssu.ac.kr',
      password: 'admin1234',
      name: '관리자',
      department: '컴퓨터학부',
      studentId: '20190000',
      phone: '010-0000-0000',
      isAdmin: true
    },
    {
      email: 'mentor1@ssu.ac.kr',
      password: 'mentor1234',
      name: '홍길동',
      department: '컴퓨터학부',
      studentId: '20190001',
      phone: '010-1111-1111',
      isAdmin: false
    },
    {
      email: 'mentor2@ssu.ac.kr',
      password: 'mentor1234',
      name: '박지성',
      department: '컴퓨터학부',
      studentId: '20190002',
      phone: '010-2222-2222',
      isAdmin: false
    },
    {
      email: 'student1@ssu.ac.kr',
      password: 'student1234',
      name: '김철수',
      department: '컴퓨터학부',
      studentId: '20200001',
      phone: '010-3333-3333',
      isAdmin: false
    },
    {
      email: 'student2@ssu.ac.kr',
      password: 'student1234',
      name: '이영희',
      department: '컴퓨터학부',
      studentId: '20200002',
      phone: '010-4444-4444',
      isAdmin: false
    },
    {
      email: 'student3@ssu.ac.kr',
      password: 'student1234',
      name: '최민수',
      department: '컴퓨터학부',
      studentId: '20200003',
      phone: '010-5555-5555',
      isAdmin: false
    }
  ],
  cohorts: [
    {
      number: 36,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-08-31'),
      lmsUrl: 'https://lms.ssu.ac.kr/36',
      funSystemUrl: 'https://fun.ssu.ac.kr/36',
      isActive: true
    },
    {
      number: 35,
      startDate: new Date('2023-09-01'),
      endDate: new Date('2024-02-29'),
      lmsUrl: 'https://lms.ssu.ac.kr/35',
      funSystemUrl: 'https://fun.ssu.ac.kr/35',
      isActive: false
    },
    {
      number: 34,
      startDate: new Date('2023-03-01'),
      endDate: new Date('2023-08-31'),
      lmsUrl: 'https://lms.ssu.ac.kr/34',
      funSystemUrl: 'https://fun.ssu.ac.kr/34',
      isActive: false
    }
  ],
  subjects: [
    {
      name: '자바스크립트 기초',
      code: 'JS101',
      mentor: {
        name: '홍길동',
        email: 'mentor1@ssu.ac.kr',
        introduction: '자바스크립트 전문가입니다.'
      },
      mentees: [
        {
          name: '김철수',
          email: 'student1@ssu.ac.kr',
          introduction: '웹 개발에 관심이 있습니다.'
        },
        {
          name: '이영희',
          email: 'student2@ssu.ac.kr',
          introduction: '프론트엔드 개발을 배우고 싶습니다.'
        }
      ]
    },
    {
      name: '리액트 심화',
      code: 'REACT201',
      mentor: {
        name: '박지성',
        email: 'mentor2@ssu.ac.kr',
        introduction: '리액트 전문가입니다.'
      },
      mentees: [
        {
          name: '최민수',
          email: 'student3@ssu.ac.kr',
          introduction: '리액트를 배우고 싶습니다.'
        }
      ]
    },
    {
      name: 'Node.js 백엔드',
      code: 'NODE101',
      mentor: {
        name: '홍길동',
        email: 'mentor1@ssu.ac.kr',
        introduction: 'Node.js와 Express 전문가입니다.'
      },
      mentees: [
        {
          name: '김철수',
          email: 'student1@ssu.ac.kr',
          introduction: '백엔드 개발에 관심이 있습니다.'
        },
        {
          name: '최민수',
          email: 'student3@ssu.ac.kr',
          introduction: '풀스택 개발자가 되고 싶습니다.'
        }
      ]
    },
    {
      name: '데이터베이스 설계',
      code: 'DB101',
      mentor: {
        name: '박지성',
        email: 'mentor2@ssu.ac.kr',
        introduction: '데이터베이스 설계 전문가입니다.'
      },
      mentees: [
        {
          name: '이영희',
          email: 'student2@ssu.ac.kr',
          introduction: '데이터베이스에 관심이 있습니다.'
        }
      ]
    }
  ]
};

// Seed function
async function seed() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Cohort.deleteMany({});
    await Subject.deleteMany({});
    await Board.deleteMany({});

    // Hash passwords and insert users
    const hashedUsers = await Promise.all(
      sampleData.users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    await User.insertMany(hashedUsers);
    console.log('Users seeded');

    // Insert cohorts
    const cohorts = await Cohort.insertMany(sampleData.cohorts);
    console.log('Cohorts seeded');

    // Insert subjects with cohort reference
    const subjects = await Subject.insertMany(
      sampleData.subjects.map(subject => ({
        ...subject,
        cohort: cohorts[0]._id // 36기 cohort에 연결
      }))
    );
    console.log('Subjects seeded');

    // Generate boards data for each subject
    const boardsData = [];
    
    subjects.forEach(subject => {
      // 공지사항
      boardsData.push({
        subject: subject._id,
        type: 'notice',
        title: `${subject.name} 멘토링 시작 안내`,
        content: `${subject.name} 멘토링이 시작됩니다. 매주 월요일 오후 2시에 진행됩니다.`,
        author: subject.mentor.name,
        createdAt: new Date('2024-03-01'),
        week: 1
      });

      // 학습 자료
      boardsData.push({
        subject: subject._id,
        type: 'materials',
        title: `${subject.name} 기초 자료`,
        content: `${subject.name}의 기본 개념과 예제 코드가 포함된 자료입니다.`,
        author: subject.mentor.name,
        createdAt: new Date('2024-03-02'),
        week: 1
      });

      // 멘티들의 진행상황
      subject.mentees.forEach(mentee => {
        boardsData.push({
          subject: subject._id,
          type: 'progress',
          title: `${mentee.name}의 1주차 학습 진도`,
          content: `${subject.name}의 기본 개념을 학습했습니다.`,
          author: mentee.name,
          createdAt: new Date('2024-03-04'),
          week: 1
        });
      });

      // 질의응답
      boardsData.push({
        subject: subject._id,
        type: 'qa',
        title: `${subject.name} 관련 질문`,
        content: `${subject.name}의 핵심 개념에 대해 더 자세히 설명해주세요.`,
        author: subject.mentees[0].name,
        createdAt: new Date('2024-03-03'),
        week: 1
      });

      // 건의사항
      boardsData.push({
        subject: subject._id,
        type: 'suggestion',
        title: `${subject.name} 수업 개선 제안`,
        content: '실습 시간을 좀 더 늘려주시면 좋겠습니다.',
        author: subject.mentees[0].name,
        createdAt: new Date('2024-03-05'),
        week: 1
      });

      // 일정 조율
      boardsData.push({
        subject: subject._id,
        type: 'schedule',
        title: `${subject.name} 멘토링 일정 조율`,
        content: '다음 주 멘토링 일정을 조율하고 싶습니다.',
        author: subject.mentor.name,
        createdAt: new Date('2024-03-06'),
        week: 1,
        schedule: {
          startDate: new Date('2024-03-11'),
          endDate: new Date('2024-03-15'),
          location: '온라인',
          participants: [...subject.mentees.map(m => m.name), subject.mentor.name]
        }
      });

      // 목표 학점
      boardsData.push({
        subject: subject._id,
        type: 'grade',
        title: `${subject.name} 목표 학점 설정`,
        content: '이번 학기 목표 학점을 설정하고 싶습니다.',
        author: subject.mentees[0].name,
        createdAt: new Date('2024-03-07'),
        week: 1,
        grade: {
          target: 4.0,
          current: 0,
          semester: '2024-1'
        }
      });
    });

    // Insert boards with subject reference
    await Board.insertMany(boardsData);
    console.log('Boards seeded');

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run seed function
seed(); 