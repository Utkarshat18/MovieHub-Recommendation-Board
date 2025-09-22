const express = require('express');
const { body, validationResult } = require('express-validator');
const Movie = require('../models/Movie');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/movies
// @desc    Get all movies sorted by score
// @access  Public
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find()
      .populate('addedBy', 'name')
      .sort({ score: -1, createdAt: -1 });

    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/movies/:id
// @desc    Get single movie with votes and comments
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate('addedBy', 'name');

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Get votes for this movie
    const votes = await Vote.find({ movie: req.params.id })
      .populate('user', 'name');

    // Get comments for this movie
    const comments = await Comment.find({ movie: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({
      movie,
      votes,
      comments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/movies
// @desc    Add a new movie
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    const movie = new Movie({
      title,
      description,
      addedBy: req.user._id
    });

    await movie.save();
    await movie.populate('addedBy', 'name');

    res.status(201).json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/movies/:id
// @desc    Delete a movie (admin only)
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if user is admin or the movie creator
    if (req.user.role !== 'admin' && movie.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this movie' });
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

module.exports = router;

