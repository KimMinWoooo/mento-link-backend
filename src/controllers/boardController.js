const Board = require('../models/Board');

// Get all posts by subject and type
exports.getPosts = async (req, res) => {
  try {
    const { subjectId, type } = req.params;
    const query = { subject: subjectId };
    
    if (type) {
      query.type = type;
    }

    const posts = await Board.find(query)
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
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
  const post = new Board({
    subject: req.body.subjectId,
    type: req.body.type,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    week: req.body.week,
    attachments: req.body.attachments || []
  });

  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await Board.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (req.body.title) post.title = req.body.title;
    if (req.body.content) post.content = req.body.content;
    if (req.body.week) post.week = req.body.week;
    if (req.body.attachments) post.attachments = req.body.attachments;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
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