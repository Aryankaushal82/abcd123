const Post = require('../models/Post');
const ScheduledPost = require('../models/ScheduledPost');
const User = require('../models/User');
const { postToLinkedIn } = require('../services/linkedin.service');
const { logger } = require('../utils/logger');

// Define Agenda jobs
exports.defineJobs = (agenda) => {
  // Job to publish a post
  agenda.define('publish post', async (job) => {
    const { postId, scheduledPostId, userId, immediate = false } = job.attrs.data;
    
    try {
      logger.info(`Starting job to publish post ${postId}`);
      
      // Get the post
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error(`Post ${postId} not found`);
      }
      
      // Get the user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      
      // Get the scheduled post if not immediate
      let scheduledPost;
      if (!immediate && scheduledPostId) {
        scheduledPost = await ScheduledPost.findById(scheduledPostId);
        if (!scheduledPost) {
          throw new Error(`Scheduled post ${scheduledPostId} not found`);
        }
        
        // Update scheduled post status
        scheduledPost.status = 'processing';
        scheduledPost.lastAttemptAt = new Date();
        scheduledPost.attempts += 1;
        await scheduledPost.save();
      }
      
      // Check if user has LinkedIn connected
      if (!user.linkedin || !user.linkedin.accessToken) {
        throw new Error('LinkedIn not connected');
      }
      
      // Publish to LinkedIn
      const result = await postToLinkedIn(
        userId,
        post.content,
        post.mediaUrls
      );
      
      // Update post status
      post.status = 'published';
      post.publishedAt = new Date();
      post.metadata = {
        ...post.metadata,
        linkedin: {
          postId: result.id,
          publishedAt: new Date()
        }
      };
      await post.save();
      
      // Update scheduled post if not immediate
      if (!immediate && scheduledPost) {
        scheduledPost.status = 'completed';
        scheduledPost.result = {
          success: true,
          data: result
        };
        await scheduledPost.save();
      }
      
      logger.info(`Successfully published post ${postId} to LinkedIn`);
      
      return { success: true, postId, linkedinPostId: result.id };
    } catch (error) {
      logger.error(`Error publishing post ${postId}:`, error);
      
      // Update post status if it's an immediate publish
      if (immediate) {
        const post = await Post.findById(postId);
        if (post) {
          post.status = 'failed';
          post.metadata = {
            ...post.metadata,
            error: {
              message: error.message,
              timestamp: new Date()
            }
          };
          await post.save();
        }
      }
      
      // Update scheduled post if not immediate
      if (!immediate && scheduledPostId) {
        const scheduledPost = await ScheduledPost.findById(scheduledPostId);
        if (scheduledPost) {
          // Check if max attempts reached
          if (scheduledPost.attempts >= scheduledPost.maxAttempts) {
            scheduledPost.status = 'failed';
            
            // Update post status
            const post = await Post.findById(postId);
            if (post) {
              post.status = 'failed';
              await post.save();
            }
          }
          
          scheduledPost.result = {
            success: false,
            error: error.message
          };
          await scheduledPost.save();
        }
      }
      
      throw error;
    }
  });
  
  // Job to clean up old completed/failed jobs
  agenda.define('cleanup old jobs', async (job) => {
    try {
      logger.info('Starting cleanup of old jobs');
      
      // Get date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Remove old completed/failed scheduled posts
      const result = await ScheduledPost.deleteMany({
        status: { $in: ['completed', 'failed'] },
        updatedAt: { $lt: thirtyDaysAgo }
      });
      
      logger.info(`Cleaned up ${result.deletedCount} old scheduled posts`);
      
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      logger.error('Error cleaning up old jobs:', error);
      throw error;
    }
  });
  
  // Schedule the cleanup job to run daily
  agenda.every('1 day', 'cleanup old jobs');
};