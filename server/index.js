require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const { setupAgenda } = require('./jobs/agenda');
const { logger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const scheduledPostRoutes = require('./routes/scheduledPost.routes');
const connectDB = require('./config/DB');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
// mongoose.connect(process.env.MONGODB_URI)
// .then(() => {
//   console.log("first entry")
//   logger.info('Connected to MongoDB');
//   })
//   .catch((err) => {
//     logger.error('MongoDB connection error:', err);
//     process.exit(1);
//   });

connectDB()
.then(() => {
  console.log("first entry")
})
.catch((err) => {
  console.log(err);
})

// Initialize Agenda (job scheduler)
const agenda = setupAgenda();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Initialize Passport
app.use(passport.initialize());
require('./config/passport')(passport);

// Make agenda available to route handlers
app.use((req, res, next) => {
  req.agenda = agenda;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/scheduled-posts', scheduledPostRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(reason);
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;