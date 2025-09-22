const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Movie = require('../models/Movie');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@moviehub.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    role: 'user'
  }
];

const sampleMovies = [
  {
    title: 'The Shawshank Redemption',
    description: 'A story of hope and friendship set in Shawshank State Penitentiary. Follow Andy Dufresne as he navigates life in prison and forms an unlikely friendship with fellow inmate Ellis "Red" Redding.',
    addedBy: null // Will be set after users are created
  },
  {
    title: 'The Godfather',
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son. A masterpiece of American cinema.',
    addedBy: null
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    addedBy: null
  },
  {
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    addedBy: null
  },
  {
    title: 'Forrest Gump',
    description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
    addedBy: null
  }
];

const sampleComments = [
  "This movie changed my perspective on life. Absolutely brilliant!",
  "One of the best films I've ever seen. Highly recommend!",
  "The cinematography is outstanding. A true masterpiece.",
  "I've watched this multiple times and it never gets old.",
  "The character development is incredible. Such depth!",
  "This film has everything - drama, action, and heart.",
  "A classic that will stand the test of time.",
  "The soundtrack is phenomenal. It adds so much to the experience.",
  "I can't believe I hadn't seen this before. Amazing!",
  "Perfect example of storytelling at its finest."
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moviehub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Vote.deleteMany({});
    await Comment.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }

    console.log(`Created ${users.length} users`);

    // Create movies
    const movies = [];
    for (let i = 0; i < sampleMovies.length; i++) {
      const movieData = {
        ...sampleMovies[i],
        addedBy: users[i % users.length]._id
      };
      const movie = new Movie(movieData);
      await movie.save();
      movies.push(movie);
    }

    console.log(`Created ${movies.length} movies`);

    // Create votes
    const votes = [];
    for (const movie of movies) {
      for (const user of users) {
        // Randomly assign votes
        if (Math.random() > 0.3) { // 70% chance of voting
          const voteType = Math.random() > 0.5 ? 'up' : 'down';
          const vote = new Vote({
            user: user._id,
            movie: movie._id,
            voteType
          });
          await vote.save();
          votes.push(vote);

          // Update movie vote counts
          if (voteType === 'up') {
            movie.upvotes += 1;
          } else {
            movie.downvotes += 1;
          }
        }
      }
      await movie.save(); // Save updated vote counts
    }

    console.log(`Created ${votes.length} votes`);

    // Create comments
    const comments = [];
    for (const movie of movies) {
      // Each movie gets 2-4 random comments
      const numComments = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < numComments; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        
        const comment = new Comment({
          user: randomUser._id,
          movie: movie._id,
          body: randomComment
        });
        await comment.save();
        comments.push(comment);
      }
    }

    console.log(`Created ${comments.length} comments`);

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@moviehub.com / admin123');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');
    console.log('User: mike@example.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedDatabase();

