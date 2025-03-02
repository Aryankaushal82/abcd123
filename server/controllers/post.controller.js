const Post = require('../models/Post');
const ScheduledPost = require('../models/ScheduledPost');
const { ApiError } = require('../utils/errors');
const { logger } = require('../utils/logger');

// Create a new post
exports.createPost = async (req, res, next) => {
  try {
    const { content, mediaUrls, platforms, scheduledAt } = req.body;
    
    // Validate content
    if (!content || content.trim() === '') {
      throw new ApiError('Post content is required', 400);
    }

    // Create post
    const post = new Post({
      user: req.user.id,
      content,
      mediaUrls: mediaUrls || [],
      platforms: platforms || ['linkedin'],
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null
    });

    await post.save();

    // If post is scheduled, create a scheduled post entry
    if (scheduledAt) {
      const scheduledPost = new ScheduledPost({
        post: post._id,
        user: req.user.id,
        scheduledAt: new Date(scheduledAt),
        platforms: platforms || ['linkedin']
      });

      await scheduledPost.save();

      // Schedule the job using Agenda
      const job = await req.agenda.schedule(
        new Date(scheduledAt),
        'publish post',
        { 
          postId: post._id.toString(),
          scheduledPostId: scheduledPost._id.toString(),
          userId: req.user.id.toString()
        }
      );

      // Update scheduled post with job ID
      scheduledPost.jobId = job.attrs._id.toString();
      await scheduledPost.save();
    }

    res.status(201).json({
      success: true,
      post
    });
  } catch (err) {
    next(err);
  }
};

// Get all posts for current user
exports.getPosts = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { 
      user: req.user.id,
      isDeleted: false
    };
    
    if (status) {
      query.status = status;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get posts
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Post.countDocuments(query);
    
    res.status(200).json({
      success: true,
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get a single post
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });
    
    if (!post) {
      throw new ApiError('Post not found', 404);
    }
    
    res.status(200).json({
      success: true,
      post
    });
  } catch (err) {
    next(err);
  }
};

// Update a post
exports.updatePost = async (req, res, next) => {
  try {
    const { content, mediaUrls, platforms, scheduledAt } = req.body;
    
    // Find post
    const post = await Post.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });
    
    if (!post) {
      throw new ApiError('Post not found', 404);
    }
    
    // Check if post can be updated
    if (post.status === 'published') {
      throw new ApiError('Published posts cannot be updated', 400);
    }
    
    // Update post
    post.content = content || post.content;
    post.mediaUrls = mediaUrls || post.mediaUrls;
    post.platforms = platforms || post.platforms;
    
    // Handle scheduling changes
    const wasScheduled = post.status === 'scheduled';
    const willBeScheduled = !!scheduledAt;
    
    if (willBeScheduled) {
      post.scheduledAt = new Date(scheduledAt);
      post.status = 'scheduled';
    } else if (wasScheduled && !willBeScheduled) {
      post.scheduledAt = null;
      post.status = 'draft';
    }
    
    await post.save();
    
    // Handle scheduled post entry
    if (wasScheduled) {
      // Find and delete existing scheduled post
      const existingScheduledPost = await ScheduledPost.findOne({
        post: post._id,
        status: { $in: ['pending', 'processing'] }
      });
      
      if (existingScheduledPost) {
        // Cancel existing job
        if (existingScheduledPost.jobId) {
          await req.agenda.cancel({ _id: existingScheduledPost.jobId });
        }
        
        if (!willBeScheduled) {
          // Delete scheduled post if no longer scheduled
          await ScheduledPost.deleteOne({ _id: existingScheduledPost._id });
        } else {
          // Update scheduled post
          existingScheduledPost.scheduledAt = new Date(scheduledAt);
          existingScheduledPost.platforms = platforms || post.platforms;
          
          // Create new job
          const job = await req.agenda.schedule(
            new Date(scheduledAt),
            'publish post',
            { 
              postId: post._id.toString(),
              scheduledPostId: existingScheduledPost._id.toString(),
              userId: req.user.id.toString()
            }
          );
          
          existingScheduledPost.jobId = job.attrs._id.toString();
          await existingScheduledPost.save();
        }
      }
    } else if (willBeScheduled) {
      // Create new scheduled post
      const scheduledPost = new ScheduledPost({
        post: post._id,
        user: req.user.id,
        scheduledAt: new Date(scheduledAt),
        platforms: platforms || post.platforms
      });
      
      await scheduledPost.save();
      
      // Schedule the job
      const job = await req.agenda.schedule(
        new Date(scheduledAt),
        'publish post',
        { 
          postId: post._id.toString(),
          scheduledPostId: scheduledPost._id.toString(),
          userId: req.user.id.toString()
        }
      );
      
      scheduledPost.jobId = job.attrs._id.toString();
      await scheduledPost.save();
    }
    
    res.status(200).json({
      success: true,
      post
    });
  } catch (err) {
    next(err);
  }
};

// Delete a post
exports.deletePost = async (req, res, next) => {
  try {
    // Find post
    const post = await Post.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });
    
    if (!post) {
      throw new ApiError('Post not found', 404);
    }
    
    // Soft delete post
    post.isDeleted = true;
    await post.save();
    
    // If post was scheduled, cancel the job
    if (post.status === 'scheduled') {
      const scheduledPost = await ScheduledPost.findOne({
        post: post._id,
        status: { $in: ['pending', 'processing'] }
      });
      
      if (scheduledPost && scheduledPost.jobId) {
        await req.agenda.cancel({ _id: scheduledPost.jobId });
        await ScheduledPost.deleteOne({ _id: scheduledPost._id });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Get scheduled posts
exports.getScheduledPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get scheduled posts
    const scheduledPosts = await ScheduledPost.find({
      user: req.user.id,
      status: { $in: ['pending', 'processing'] }
    })
      .populate('post')
      .sort({ scheduledAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await ScheduledPost.countDocuments({
      user: req.user.id,
      status: { $in: ['pending', 'processing'] }
    });
    
    res.status(200).json({
      success: true,
      scheduledPosts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// Cancel scheduled post
exports.cancelScheduledPost = async (req, res, next) => {
  try {
    // Find scheduled post
    const scheduledPost = await ScheduledPost.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: { $in: ['pending', 'processing'] }
    });
    
    if (!scheduledPost) {
      throw new ApiError('Scheduled post not found', 404);
    }
    
    // Cancel job
    if (scheduledPost.jobId) {
      await req.agenda.cancel({ _id: scheduledPost.jobId });
    }
    
    // Update post status
    const post = await Post.findById(scheduledPost.post);
    if (post) {
      post.status = 'draft';
      post.scheduledAt = null;
      await post.save();
    }
    
    // Delete scheduled post
    await ScheduledPost.deleteOne({ _id: scheduledPost._id });
    
    res.status(200).json({
      success: true,
      message: 'Scheduled post cancelled successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Publish post now
exports.publishNow = async (req, res, next) => {
  try {
    // Find post
    const post = await Post.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });
    
    if (!post) {
      throw new ApiError('Post not found', 404);
    }
    
    // Check if post can be published
    if (post.status === 'published') {
      throw new ApiError('Post is already published', 400);
    }
    
    // If post was scheduled, cancel the scheduled job
    if (post.status === 'scheduled') {
      const scheduledPost = await ScheduledPost.findOne({
        post: post._id,
        status: { $in: ['pending', 'processing'] }
      });
      
      if (scheduledPost && scheduledPost.jobId) {
        await req.agenda.cancel({ _id: scheduledPost.jobId });
        await ScheduledPost.deleteOne({ _id: scheduledPost._id });
      }
    }
    
    // Create a new job to publish immediately
    const job = await req.agenda.now('publish post', {
      postId: post._id.toString(),
      userId: req.user.id.toString(),
      immediate: true
    });
    
    res.status(200).json({
      success: true,
      message: 'Post queued for immediate publishing',
      jobId: job.attrs._id.toString()
    });
  } catch (err) {
    next(err);
  }
};