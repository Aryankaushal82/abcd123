const express = require('express');
const postController = require('../controllers/post.controller');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply authentication to all post routes
router.use(authenticate);

// Apply rate limiting
router.use(rateLimiter(60, 60)); // 60 requests per minute

// Create a new post
router.post('/', postController.createPost);

// Get all posts
router.get('/', postController.getPosts);

// Get a single post
router.get('/:id', postController.getPost);

// Update a post
router.put('/:id', postController.updatePost);

// Delete a post
router.delete('/:id', postController.deletePost);

// Get scheduled posts
router.get('/scheduled/list', postController.getScheduledPosts);

// Cancel scheduled post
router.delete('/scheduled/:id', postController.cancelScheduledPost);

// Publish post now
router.post('/:id/publish-now', postController.publishNow);

module.exports = router;