const mongoose = require('mongoose');

const ScheduledPostSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  jobId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  lastAttemptAt: {
    type: Date
  },
  result: {
    success: Boolean,
    error: String,
    data: Object
  },
  platforms: [{
    type: String,
    enum: ['linkedin'],
    default: ['linkedin']
  }]
}, {
  timestamps: true
});

// Index for efficient queries
ScheduledPostSchema.index({ scheduledAt: 1, status: 1 });
ScheduledPostSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('ScheduledPost', ScheduledPostSchema);