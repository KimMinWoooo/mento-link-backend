const Board = require('../models/Board');
const mongoose = require('mongoose');

// Get all posts by subject and type
exports.getPosts = async (req, res) => {
  try {
    const { subjectId, type } = req.params;
    
    // Validate subjectId
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }

    const query = { subject: subjectId };
    
    if (type && ['notice', 'progress', 'materials', 'qa', 'suggestion', 'schedule', 'grade'].includes(type)) {
      query.type = type;
    }

    const posts = await Board.find(query)
      .populate({
        path: 'subject',
        select: 'name code',
        transform: doc => ({
          _id: doc._id,
          name: doc.name,
          code: doc.code
        })
      })
      .sort({ createdAt: -1 });

    // Transform posts to ensure subject is properly formatted
    const transformedPosts = posts.map(post => ({
      ...post.toObject(),
      subject: post.subject._id
    }));

    res.json(transformedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single post
exports.getPost = async (req, res) => {
  try {
    const post = await Board.findById(req.params.id)
      .populate('subject', 'name code');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create post
exports.createPost = async (req, res) => {
  try {
    // 필수 필드 검증
    if (!req.body.type) {
      return res.status(400).json({ message: 'Type is required' });
    }
    if (!req.body.title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!req.body.content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const postData = {
      type: req.body.type,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author || 'Anonymous',
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true
    };

    // 공지사항인 경우 subject를 'main'으로 설정
    if (req.body.type === 'notice' && req.body.isMainNotice) {
      postData.subject = 'main';
    } else {
      // 일반 게시글인 경우 subject 필드 검증
      if (!req.body.subject) {
        return res.status(400).json({ message: 'Subject is required' });
      }
      postData.subject = req.body.subject;
    }

    // 게시판 타입별 추가 필드 처리
    if (req.body.type === 'progress') {
      if (!req.body.week) {
        return res.status(400).json({ message: 'Week is required for progress posts' });
      }
      postData.week = req.body.week;
      postData.learningGoals = req.body.goals ? req.body.goals.map(goal => ({
        goal,
        completed: false
      })) : [];
    } else if (req.body.type === 'schedule') {
      if (!req.body.startDate || !req.body.endDate) {
        return res.status(400).json({ message: 'Start date and end date are required for schedule posts' });
      }
      postData.schedule = {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        location: req.body.location || '',
        participants: req.body.participants ? req.body.participants.split(',').map(p => p.trim()) : []
      };
    } else if (req.body.type === 'grade') {
      if (!req.body.targetGrade || !req.body.currentGrade) {
        return res.status(400).json({ message: 'Target grade and current grade are required for grade posts' });
      }
      postData.grade = {
        target: req.body.targetGrade,
        current: req.body.currentGrade,
        semester: req.body.semester || ''
      };
    }

    // 파일 첨부 처리
    if (req.body.attachments) {
      postData.attachments = req.body.attachments;
    }

    const post = new Board(postData);
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await Board.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // 기본 필드 업데이트
    if (req.body.title) post.title = req.body.title;
    if (req.body.content) post.content = req.body.content;
    if (req.body.isPublic !== undefined) post.isPublic = req.body.isPublic;

    // 게시판 타입별 필드 업데이트
    if (post.type === 'progress') {
      if (req.body.week) post.week = req.body.week;
      if (req.body.goals) {
        post.learningGoals = req.body.goals.map(goal => ({
          goal,
          completed: false
        }));
      }
    } else if (post.type === 'schedule') {
      if (req.body.startDate) post.schedule.startDate = req.body.startDate;
      if (req.body.endDate) post.schedule.endDate = req.body.endDate;
      if (req.body.location) post.schedule.location = req.body.location;
      if (req.body.participants) {
        post.schedule.participants = req.body.participants.split(',').map(p => p.trim());
      }
    } else if (post.type === 'grade') {
      if (req.body.targetGrade) post.grade.target = req.body.targetGrade;
      if (req.body.currentGrade) post.grade.current = req.body.currentGrade;
      if (req.body.semester) post.grade.semester = req.body.semester;
    }

    // 파일 첨부 업데이트
    if (req.body.attachments) {
      post.attachments = req.body.attachments;
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Board.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 