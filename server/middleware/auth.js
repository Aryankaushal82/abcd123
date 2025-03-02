const passport = require('passport');
const { ApiError } = require('../utils/errors');

// Middleware to authenticate requests using JWT
exports.authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return next(new ApiError('Unauthorized - Invalid or expired token', 401));
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware to check if user has admin role
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return next(new ApiError('Forbidden - Admin access required', 403));
};

// Middleware to check if user has LinkedIn connected
exports.hasLinkedIn = (req, res, next) => {
  if (req.user && req.user.linkedin && req.user.linkedin.accessToken) {
    return next();
  }
  
  return next(new ApiError('LinkedIn account not connected', 403));
};