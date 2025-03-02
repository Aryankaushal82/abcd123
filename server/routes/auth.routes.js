const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to auth routes
router.use(rateLimiter(15, 60)); // 15 requests per minute

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// Logout user
router.post('/logout', authController.logout);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// LinkedIn OAuth routes
router.get('/linkedin', passport.authenticate('linkedin'));

router.get(
  '/linkedin/callback',
  passport.authenticate('linkedin', { session: false }),
  authController.linkedinCallback
);

module.exports = router;