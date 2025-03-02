const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logger } = require('../utils/logger');
const { ApiError } = require('../utils/errors');

// Generate JWT tokens
const generateTokens = (user) => {
  // Access token
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Refresh token
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  // Calculate expiry date for refresh token
  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days from now

  return { accessToken, refreshToken, refreshTokenExpiry };
};

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError('User with this email already exists', 400);
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken, refreshTokenExpiry } = generateTokens(user);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshTokenExpiry
    });
    await user.save();

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken, refreshTokenExpiry } = generateTokens(user);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshTokenExpiry
    });
    await user.save();

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasLinkedIn: !!user.linkedin.id
      }
    });
  } catch (err) {
    next(err);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError('Refresh token is required', 400);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new ApiError('Invalid refresh token', 401);
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const tokenExists = user.refreshTokens.find(t => t.token === refreshToken);
    if (!tokenExists) {
      throw new ApiError('Invalid refresh token', 401);
    }

    // Check if token is expired
    if (new Date() > tokenExists.expiresAt) {
      // Remove expired token
      user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
      await user.save();
      throw new ApiError('Refresh token expired', 401);
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken, refreshTokenExpiry } = generateTokens(user);

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: refreshTokenExpiry
    });
    await user.save();

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    next(err);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError('Refresh token is required', 400);
    }

    // Find user by refresh token
    const user = await User.findOne({ 'refreshTokens.token': refreshToken });
    if (user) {
      // Remove refresh token
      user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasLinkedIn: !!user.linkedin.id
      }
    });
  } catch (err) {
    next(err);
  }
};

// LinkedIn callback
exports.linkedinCallback = async (req, res, next) => {
  try {
    // User is already authenticated by Passport at this point
    const user = req.user;

    // Generate tokens
    const { accessToken, refreshToken, refreshTokenExpiry } = generateTokens(user);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshTokenExpiry
    });
    await user.save();

    // Redirect to frontend with tokens
    // In a real application, you would redirect to your frontend with tokens
    // For this example, we'll just return the tokens
    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasLinkedIn: !!user.linkedin.id
      }
    });
  } catch (err) {
    next(err);
  }
};