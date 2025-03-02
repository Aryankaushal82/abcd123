const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 3000
  },
  mediaUrls: [{
    type: String,
    trim: true
  }],
  platforms: [{
    type: String,
    enum: ['linkedin'],
    default: ['linkedin']
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft'
  },
  scheduledAt: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  metadata: {
    type: Object,
    default: {}
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
PostSchema.index({ user: 1, status: 1 });
PostSchema.index({ scheduledAt: 1 }, { sparse: true });

module.exports = mongoose.model('Post', PostSchema);