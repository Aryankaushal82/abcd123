import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { getPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const DraftPosts = () => {
  const [page, setPage] = useState(1);
  const limit = 5;

  // Fetch draft posts
  const { data, isLoading, error } = useQuery(
    ['draftPosts', page],
    () => getPosts({ status: 'draft', page, limit }),
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
        <h2 className="text-2xl font-semibold text-gray-900">Error loading draft posts</h2>
        <p className="mt-2 text-gray-500">{error.message}</p>
      </div>
    );
  }

  const { posts, pagination } = data;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Draft Posts</h1>
        <p className="mt-1 text-sm text-gray-500">
          Continue working on your draft posts
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
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
          title="No draft posts"
          description="You don't have any draft posts yet"
          buttonText="Create Post"
          buttonLink="/posts/create"
        />
      )}
    </motion.div>
  );
};

export default DraftPosts;