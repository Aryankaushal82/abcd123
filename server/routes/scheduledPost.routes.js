const express = require('express');
const postController = require('../controllers/post.controller');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply authentication to all scheduled post routes
router.use(authenticate);

// Apply rate limiting
router.use(rateLimiter(60, 60)); // 60 requests per minute

// Get scheduled posts
router.get('/', postController.getScheduledPosts);

// Cancel scheduled post
router.delete('/:id', postController.cancelScheduledPost);

module.exports = router;