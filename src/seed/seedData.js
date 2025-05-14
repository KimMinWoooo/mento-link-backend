const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cohort = require('../models/Cohort');
const Subject = require('../models/Subject');
const Board = require('../models/Board');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample data
const sampleData = {
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
    }
  ],
  boards: [
    {
      subject: subjects[0]._id,
      type: 'notice',
      title: '멘토링 시작 안내',
      content: '자바스크립트 기초 멘토링이 시작됩니다. 매주 월요일 오후 2시에 진행됩니다.',
      author: '홍길동',
      createdAt: new Date('2024-03-01')
    },
    {
      subject: subjects[0]._id,
      type: 'notice',
      title: '과제 제출 안내',
      content: '이번 주 과제는 JavaScript 기본 문법 실습입니다. 다음 수업 전까지 제출해주세요.',
      author: '홍길동',
      createdAt: new Date('2024-03-05')
    },
    {
      subject: subjects[0]._id,
      type: 'notice',
      title: '수업 자료 업로드',
      content: '이번 주 수업 자료가 업로드되었습니다. 미리 예습해주세요.',
      author: '홍길동',
      createdAt: new Date('2024-03-08')
    },
    {
      subject: subjects[1]._id,
      type: 'notice',
      title: '리액트 심화 멘토링 안내',
      content: '리액트 심화 멘토링이 시작됩니다. 매주 수요일 오후 3시에 진행됩니다.',
      author: '박지성',
      createdAt: new Date('2024-03-01')
    },
    {
      subject: subjects[1]._id,
      type: 'notice',
      title: '프로젝트 발표 일정',
      content: '최종 프로젝트 발표는 4월 15일 오후 2시에 진행됩니다.',
      author: '박지성',
      createdAt: new Date('2024-03-10')
    },
    {
      subject: subjects[1]._id,
      type: 'notice',
      title: '리액트 라이브러리 소개',
      content: '이번 주는 Redux와 React Query에 대해 학습합니다.',
      author: '박지성',
      createdAt: new Date('2024-03-12')
    },
    {
      subject: subjects[0]._id,
      type: 'progress',
      title: '1주차 학습 진도',
      content: '자바스크립트 기본 문법과 변수, 함수에 대해 학습했습니다.',
      author: '김철수',
      createdAt: new Date('2024-03-04')
    },
    {
      subject: subjects[0]._id,
      type: 'materials',
      title: '자바스크립트 기초 자료',
      content: '자바스크립트 기본 문법과 예제 코드가 포함된 자료입니다.',
      author: '홍길동',
      createdAt: new Date('2024-03-02')
    },
    {
      subject: subjects[0]._id,
      type: 'qa',
      title: '자바스크립트 질문',
      content: '클로저와 스코프에 대해 더 자세히 설명해주세요.',
      author: '이영희',
      createdAt: new Date('2024-03-03')
    }
  ]
};

// Seed function
async function seed() {
  try {
    // Clear existing data
    await Cohort.deleteMany({});
    await Subject.deleteMany({});
    await Board.deleteMany({});

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

    // Insert boards with subject reference
    const boards = await Board.insertMany(
      sampleData.boards.map(board => ({
        ...board,
        subject: subjects[0]._id // 자바스크립트 기초 과목에 연결
      }))
    );
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