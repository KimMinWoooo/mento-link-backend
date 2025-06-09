const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  type: {
    type: String,
    enum: [
      'notice',      // 공지사항
      'progress',    // 진행상황
      'materials',   // 자료실
      'qa',         // 질의응답
      'suggestion', // 건의사항
      'schedule',   // 일정 조율
      'grade'       // 목표 학점
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  // 진행상황(progress) 게시글용 새 필드
  teamNumber: {
    type: String,
    required: function() { return this.type === 'progress'; }
  },
  session: {
    type: String,
    required: function() { return this.type === 'progress'; }
  },
  tutorName: {
    type: String,
    required: function() { return this.type === 'progress'; }
  },
  dateTime: {
    type: String,
    required: function() { return this.type === 'progress'; }
  },
  attendees: [{
    type: String
  }],
  learningContent: {
    type: String
  },
  tutorProgress: {
    type: String
  },
  activityPhoto: {
    filename: String,
    url: String,
    uploadedAt: Date
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    location: String,
    participants: [String]
  },
  grade: {
    target: Number,
    current: Number,
    semester: String
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date,
    isPublic: {
      type: Boolean,
      default: true
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
boardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Board', boardSchema); 