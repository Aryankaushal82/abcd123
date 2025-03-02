const fetch = require('node-fetch');
const User = require('../models/User');
const { ApiError } = require('../utils/errors');
const { logger } = require('../utils/logger');

// LinkedIn API endpoints
const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';
const LINKEDIN_SHARE_URL = `${LINKEDIN_API_URL}/shares`;
const LINKEDIN_PERSON_URL = `${LINKEDIN_API_URL}/me`;
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

// Refresh LinkedIn access token
const refreshLinkedInToken = async (user) => {
  try {
    if (!user.linkedin.refreshToken) {
      throw new ApiError('No refresh token available', 401);
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', user.linkedin.refreshToken);
    params.append('client_id', process.env.LINKEDIN_CLIENT_ID);
    params.append('client_secret', process.env.LINKEDIN_CLIENT_SECRET);

    const response = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error('LinkedIn token refresh failed', data);
      throw new ApiError('Failed to refresh LinkedIn token', 401);
    }

    // Update user's LinkedIn tokens
    user.linkedin.accessToken = data.access_token;
    if (data.refresh_token) {
      user.linkedin.refreshToken = data.refresh_token;
    }

    // Set token expiry (default to 60 days if not provided)
    const expiresIn = data.expires_in || 5184000; // 60 days in seconds
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);
    user.linkedin.tokenExpiry = expiryDate;

    await user.save();
    return user;
  } catch (error) {
    logger.error('Error refreshing LinkedIn token:', error);
    throw error;
  }
};

// Get user's LinkedIn profile
const getLinkedInProfile = async (userId) => {
  try {
    let user = await User.findById(userId);
    if (!user || !user.linkedin.accessToken) {
      throw new ApiError('LinkedIn not connected', 401);
    }

    // Check if token is expired and refresh if needed
    if (user.isLinkedInTokenExpired()) {
      user = await refreshLinkedInToken(user);
    }

    const response = await fetch(`${LINKEDIN_PERSON_URL}`, {
      headers: {
        Authorization: `Bearer ${user.linkedin.accessToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try refreshing token once
        user = await refreshLinkedInToken(user);
        return getLinkedInProfile(userId);
      }
      throw new ApiError('Failed to fetch LinkedIn profile', response.status);
    }

    return await response.json();
  } catch (error) {
    logger.error('Error getting LinkedIn profile:', error);
    throw error;
  }
};

// Post to LinkedIn
const postToLinkedIn = async (userId, content, mediaUrls = []) => {
  try {
    let user = await User.findById(userId);
    if (!user || !user.linkedin.accessToken) {
      throw new ApiError('LinkedIn not connected', 401);
    }

    // Check if token is expired and refresh if needed
    if (user.isLinkedInTokenExpired()) {
      user = await refreshLinkedInToken(user);
    }

    // Get user's LinkedIn URN
    const profile = await getLinkedInProfile(userId);
    const personUrn = profile.id;

    // Prepare share content
    const shareData = {
      owner: `urn:li:person:${personUrn}`,
      text: {
        text: content
      },
      distribution: {
        linkedInDistributionTarget: {}
      }
    };

    // Add media if provided
    if (mediaUrls && mediaUrls.length > 0) {
      // Note: Implementing media upload requires additional steps
      // This is a simplified version that assumes mediaUrls are already LinkedIn media URNs
      // In a real implementation, you would need to upload media to LinkedIn first
      logger.info('Media URLs provided but not implemented in this example');
    }

    // Post to LinkedIn
    const response = await fetch(LINKEDIN_SHARE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.linkedin.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(shareData)
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Try refreshing token once
        user = await refreshLinkedInToken(user);
        return postToLinkedIn(userId, content, mediaUrls);
      }
      logger.error('LinkedIn post failed', data);
      throw new ApiError(`Failed to post to LinkedIn: ${data.message || 'Unknown error'}`, response.status);
    }

    return data;
  } catch (error) {
    logger.error('Error posting to LinkedIn:', error);
    throw error;
  }
};

module.exports = {
  refreshLinkedInToken,
  getLinkedInProfile,
  postToLinkedIn
};