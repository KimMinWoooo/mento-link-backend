const Comment = require('../models/Comment');
const Board = require('../models/Board');

// Get comments for a board
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ board: req.params.boardId })
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create comment
exports.createComment = async (req, res) => {
  try {
    // Check if board exists
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const comment = new Comment({
      board: req.params.boardId,
      author: req.body.author,
      content: req.body.content,
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true
    });

    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    if (req.body.content) comment.content = req.body.content;
    if (req.body.isPublic !== undefined) comment.isPublic = req.body.isPublic;
    comment.updatedAt = Date.now();

    const updatedComment = await comment.save();
    res.json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    await comment.deleteOne();
    res.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 