const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate score before saving
movieSchema.pre('save', function(next) {
  this.score = this.upvotes - this.downvotes;
  next();
});

module.exports = mongoose.model('Movie', movieSchema);

