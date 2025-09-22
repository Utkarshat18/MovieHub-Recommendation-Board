const express = require('express');
const { body, validationResult } = require('express-validator');
const Vote = require('../models/Vote');
const Movie = require('../models/Movie');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/votes
// @desc    Vote on a movie
// @access  Private
router.post('/', [
  auth,
  body('movieId').isMongoId().withMessage('Valid movie ID is required'),
  body('voteType').isIn(['up', 'down']).withMessage('Vote type must be up or down')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { movieId, voteType } = req.body;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      user: req.user._id,
      movie: movieId
    });

    if (existingVote) {
      // Update existing vote
      if (existingVote.voteType === voteType) {
        // Same vote type - remove the vote
        await Vote.findByIdAndDelete(existingVote._id);
        
        // Update movie vote counts
        if (voteType === 'up') {
          movie.upvotes = Math.max(0, movie.upvotes - 1);
        } else {
          movie.downvotes = Math.max(0, movie.downvotes - 1);
        }
        await movie.save();

        return res.json({ message: 'Vote removed', voteType: null });
      } else {
        // Different vote type - update the vote
        const oldVoteType = existingVote.voteType;
        existingVote.voteType = voteType;
        await existingVote.save();

        // Update movie vote counts
        if (oldVoteType === 'up') {
          movie.upvotes = Math.max(0, movie.upvotes - 1);
        } else {
          movie.downvotes = Math.max(0, movie.downvotes - 1);
        }

        if (voteType === 'up') {
          movie.upvotes += 1;
        } else {
          movie.downvotes += 1;
        }
        await movie.save();

        return res.json({ message: 'Vote updated', voteType });
      }
    } else {
      // Create new vote
      const vote = new Vote({
        user: req.user._id,
        movie: movieId,
        voteType
      });

      await vote.save();

      // Update movie vote counts
      if (voteType === 'up') {
        movie.upvotes += 1;
      } else {
        movie.downvotes += 1;
      }
      await movie.save();

      res.status(201).json({ message: 'Vote added', voteType });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/votes/movie/:movieId
// @desc    Get votes for a specific movie
// @access  Public
router.get('/movie/:movieId', async (req, res) => {
  try {
    const votes = await Vote.find({ movie: req.params.movieId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(votes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/votes/user/:userId
// @desc    Get votes by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const votes = await Vote.find({ user: req.params.userId })
      .populate('movie', 'title')
      .sort({ createdAt: -1 });

    res.json(votes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

