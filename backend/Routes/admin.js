const express = require('express');
const Movie = require('../models/Movie');
const Comment = require('../models/Comment');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(auth, adminAuth);

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/stats', async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalVotes = await Vote.countDocuments();

    // Top movies by score
    const topMovies = await Movie.find()
      .populate('addedBy', 'name')
      .sort({ score: -1 })
      .limit(10);

    // Recent activity
    const recentMovies = await Movie.find()
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentComments = await Comment.find()
      .populate('user', 'name')
      .populate('movie', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalMovies,
        totalUsers,
        totalComments,
        totalVotes
      },
      topMovies,
      recentActivity: {
        movies: recentMovies,
        comments: recentComments
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/movies
// @desc    Get all movies for admin management
// @access  Private (Admin)
router.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find()
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/movies/:id
// @desc    Delete any movie (admin only)
// @access  Private (Admin)
router.delete('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Delete associated votes and comments
    await Vote.deleteMany({ movie: req.params.id });
    await Comment.deleteMany({ movie: req.params.id });
    await Movie.findByIdAndDelete(req.params.id);

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/comments
// @desc    Get all comments for admin management
// @access  Private (Admin)
router.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('user', 'name')
      .populate('movie', 'title')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/comments/:id
// @desc    Delete any comment (admin only)
// @access  Private (Admin)
router.delete('/comments/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin management
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

