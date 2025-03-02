import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { TrashIcon, PencilIcon, ClockIcon, CheckIcon } from '@heroicons/react/outline';
import { formatDate, formatRelativeTime, getTimeUntil } from '../utils/formatDate';
import { deletePost, publishNow, cancelScheduledPost } from '../services/postService';
import PropTypes from 'prop-types';

const PostCard = ({ post, scheduledPostId = null }) => {
  const queryClient = useQueryClient();

  // Delete post mutation
  const deleteMutation = useMutation(deletePost, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts');
      queryClient.invalidateQueries('scheduledPosts');
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    },
  });

  // Publish now mutation
  const publishMutation = useMutation(publishNow, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts');
      queryClient.invalidateQueries('scheduledPosts');
      toast.success('Post queued for publishing');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to publish post');
    },
  });

  // Cancel scheduled post mutation
  const cancelMutation = useMutation(cancelScheduledPost, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts');
      queryClient.invalidateQueries('scheduledPosts');
      toast.success('Scheduled post cancelled');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel scheduled post');
    },
  });

  // Handle delete post
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(post._id);
    }
  };

  // Handle publish now
  const handlePublishNow = () => {
    if (window.confirm('Are you sure you want to publish this post now?')) {
      publishMutation.mutate(post._id);
    }
  };

  // Handle cancel scheduled post
  const handleCancelSchedule = () => {
    if (window.confirm('Are you sure you want to cancel this scheduled post?')) {
      cancelMutation.mutate(scheduledPostId);
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (post.status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <ClockIcon className="mr-1 h-3 w-3" />
            Scheduled
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckIcon className="mr-1 h-3 w-3" />
            Published
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="card"
    >
      <div className="card-header flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <span className="text-sm text-gray-500">
            {post.status === 'published'
              ? `Published ${formatRelativeTime(post.publishedAt)}`
              : post.status === 'scheduled'
              ? `Scheduled for ${formatDate(post.scheduledAt)} (${getTimeUntil(
                  post.scheduledAt
                )} from now)`
              : `Last updated ${formatRelativeTime(post.updatedAt)}`}
          </span>
        </div>
        <div className="flex space-x-2">
          {post.status !== 'published' && (
            <Link
              to={`/posts/edit/${post._id}`}
              className="text-gray-400 hover:text-gray-500"
            >
              <PencilIcon className="h-5 w-5" />
            </Link>
          )}
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500"
            title="Delete post"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="card-body">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-500">Media:</h4>
            <div className="flex flex-wrap gap-2">
              {post.mediaUrls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800 text-sm truncate max-w-xs"
                >
                  {url}
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-500">Platforms:</h4>
          <div className="flex space-x-2 mt-1">
            {post.platforms.map((platform) => (
              <span
                key={platform}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
      {post.status !== 'published' && (
        <div className="card-footer flex justify-end space-x-3">
          {post.status === 'scheduled' && scheduledPostId && (
            <button
              onClick={handleCancelSchedule}
              className="btn btn-secondary"
              disabled={cancelMutation.isLoading}
            >
              Cancel Schedule
            </button>
          )}
          {post.status !== 'published' && (
            <button
              onClick={handlePublishNow}
              className="btn btn-primary"
              disabled={publishMutation.isLoading}
            >
              Publish Now
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    mediaUrls: PropTypes.arrayOf(PropTypes.string),
    platforms: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string.isRequired,
    scheduledAt: PropTypes.string,
    publishedAt: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  scheduledPostId: PropTypes.string,
};

export default PostCard;