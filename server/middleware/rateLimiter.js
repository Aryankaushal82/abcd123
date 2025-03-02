const rateLimit = require('express-rate-limit');
const { ApiError } = require('../utils/errors');

// Rate limiter middleware factory
exports.rateLimiter = (maxRequests, windowMinutes) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000, // Convert minutes to milliseconds
    max: maxRequests, // Limit each IP to maxRequests requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next) => {
      next(new ApiError(`Too many requests, please try again after ${windowMinutes} minutes`, 429));
    }
  });
};