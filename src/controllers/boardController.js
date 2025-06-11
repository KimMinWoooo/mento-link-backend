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
    // 공지사항(메인) 작성은 관리자만
    if (req.body.type === 'notice' && req.body.isMainNotice && (!req.user || !req.user.isAdmin)) {
      return res.status(403).json({ message: '관리자만 공지사항을 작성할 수 있습니다.' });
    }
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

    // 공지사항인 경우 subject를 전체 공지 ObjectId로 설정
    if (req.body.type === 'notice' && req.body.isMainNotice) {
      postData.subject = '682edd408423789a032fe819';
    } else {
      // 일반 게시글인 경우 subject 필드 검증
      if (!req.body.subject) {
        return res.status(400).json({ message: 'Subject is required' });
      }
      postData.subject = req.body.subject;
    }

    // 게시판 타입별 추가 필드 처리
    if (req.body.type === 'progress') {
      postData.teamNumber = req.body.teamNumber;
      postData.session = req.body.session;
      postData.tutorName = req.body.tutorName;
      postData.dateTime = req.body.dateTime;
      postData.attendees = req.body.attendees ? req.body.attendees.split(',').map(a => a.trim()) : [];
      postData.learningContent = req.body.learningContent;
      postData.tutorProgress = req.body.tutorProgress;
      // 활동사진 파일 업로드
      if (req.files && req.files.activityPhoto && req.files.activityPhoto[0]) {
        const file = req.files.activityPhoto[0];
        const fileUrl = `/uploads/${file.filename}`;
        postData.activityPhoto = {
          filename: file.originalname,
          url: fileUrl,
          uploadedAt: new Date()
        };
        // activityPhoto를 attachments에도 추가
        postData.attachments = [{
          filename: file.originalname,
          url: fileUrl,
          uploadedAt: new Date(),
          isPublic: true
        }];
      }
    } else if (req.body.type === 'schedule') {
      try {
        const scheduleData = JSON.parse(req.body.schedule);
        if (!scheduleData.startDate || !scheduleData.endDate) {
          return res.status(400).json({ message: 'Start date and end date are required for schedule posts' });
        }
        postData.schedule = {
          startDate: new Date(scheduleData.startDate),
          endDate: new Date(scheduleData.endDate),
          location: scheduleData.location || '',
          participants: scheduleData.participants || []
        };
      } catch (error) {
        console.error('Error parsing schedule data:', error);
        return res.status(400).json({ message: 'Invalid schedule data format' });
      }
    } else if (req.body.type === 'grade') {
      // grade가 문자열로 오면 파싱
      if (req.body.grade && typeof req.body.grade === 'string') {
        try {
          req.body.grade = JSON.parse(req.body.grade);
        } catch (e) {
          return res.status(400).json({ message: 'Invalid grade data' });
        }
      }
      if (!req.body.grade || !req.body.grade.target || !req.body.grade.current) {
        return res.status(400).json({ message: 'Target grade and current grade are required for grade posts' });
      }
      postData.grade = {
        target: req.body.grade.target,
        current: req.body.grade.current,
        semester: req.body.grade.semester || ''
      };
    }

    // 파일 첨부 처리 (multer로 업로드된 파일)
    if (req.files && req.files.files && req.files.files.length > 0) {
      postData.attachments = req.files.files.map(file => ({
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        uploadedAt: new Date(),
        isPublic: true
      }));
    } else if (req.body.attachments) {
      try {
        const attachments = JSON.parse(req.body.attachments);
        // attachments의 url 필드를 서버에서 생성한 파일명으로 업데이트
        if (req.files && req.files.activityPhoto && req.files.activityPhoto[0]) {
          const file = req.files.activityPhoto[0];
          attachments[0].url = `/uploads/${file.filename}`;
        }
        postData.attachments = attachments;
      } catch (error) {
        console.error('Error parsing attachments:', error);
        return res.status(400).json({ message: 'Invalid attachments format' });
      }
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
    // 권한 체크: 관리자 또는 작성자(학번)
    if (!req.user.isAdmin && String(post.author) !== String(req.user.studentId)) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    // 기본 필드 업데이트
    if (req.body.title) post.title = req.body.title;
    if (req.body.content) post.content = req.body.content;
    if (req.body.isPublic !== undefined) post.isPublic = req.body.isPublic;

    // 게시판 타입별 필드 업데이트
    if (post.type === 'progress') {
      if (req.body.teamNumber) post.teamNumber = req.body.teamNumber;
      if (req.body.session) post.session = req.body.session;
      if (req.body.tutorName) post.tutorName = req.body.tutorName;
      if (req.body.dateTime) post.dateTime = req.body.dateTime;
      if (req.body.attendees) post.attendees = req.body.attendees.split(',').map(a => a.trim());
      if (req.body.learningContent) post.learningContent = req.body.learningContent;
      if (req.body.tutorProgress) post.tutorProgress = req.body.tutorProgress;
      // 활동사진 파일 업로드
      if (req.files && req.files.activityPhoto && req.files.activityPhoto[0]) {
        const file = req.files.activityPhoto[0];
        const fileUrl = `/uploads/${file.filename}`;
        post.activityPhoto = {
          filename: file.originalname,
          url: fileUrl,
          uploadedAt: new Date()
        };
        // activityPhoto를 attachments에도 추가
        post.attachments = [{
          filename: file.originalname,
          url: fileUrl,
          uploadedAt: new Date(),
          isPublic: true
        }];
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

    // 파일 첨부 업데이트 (multer로 업로드된 파일)
    if (req.files && req.files.files && req.files.files.length > 0) {
      post.attachments = req.files.files.map(file => ({
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        uploadedAt: new Date(),
        isPublic: true
      }));
    } else if (req.body.attachments) {
      try {
        const attachments = JSON.parse(req.body.attachments);
        post.attachments = attachments;
      } catch (error) {
        console.error('Error parsing attachments:', error);
        return res.status(400).json({ message: 'Invalid attachments format' });
      }
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
    // 진단용 로그 추가
    console.log('post.author:', post.author, 'req.user.studentId:', req.user.studentId, 'isAdmin:', req.user.isAdmin);

    // 권한 체크: 관리자 또는 작성자(학번)
    if (!req.user.isAdmin && String(post.author) !== String(req.user.studentId)) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};