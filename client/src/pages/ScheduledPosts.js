import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { getScheduledPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const ScheduledPosts = () => {
  const [page, setPage] = useState(1);
  const limit = 5;

  // Fetch scheduled posts
  const { data, isLoading, error } = useQuery(
    ['scheduledPosts', page],
    () => getScheduledPosts({ page, limit }),
    {
      keepPreviousData: true,
    }
  );

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Error loading scheduled posts</h2>
        <p className="mt-2 text-gray-500">{error.message}</p>
      </div>
    );
  }

  const { scheduledPosts, pagination } = data;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Scheduled Posts</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your scheduled posts for LinkedIn
        </p>
      </div>

      {scheduledPosts && scheduledPosts.length > 0 ? (
        <div className="space-y-6">
          {scheduledPosts.map((scheduledPost) => (
            <PostCard
              key={scheduledPost._id}
              post={scheduledPost.post}
              scheduledPostId={scheduledPost._id}
            />
          ))}

          {pagination && pagination.pages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      ) : (
        <EmptyState
          title="No scheduled posts"
          description="You don't have any scheduled posts yet"
          buttonText="Create Post"
          buttonLink="/posts/create"
        />
      )}
    </motion.div>
  );
};

export default ScheduledPosts;