import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import PostForm from '../components/PostForm';
import LoadingScreen from '../components/LoadingScreen';
import { getPost, updatePost } from '../services/postService';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch post data
  const { data, isLoading, error } = useQuery(['post', id], () => getPost(id));

  // Update post mutation
  const mutation = useMutation((postData) => updatePost(id, postData), {
    onSuccess: (data) => {
      toast.success('Post updated successfully');
      if (data.post.status === 'scheduled') {
        navigate('/posts/scheduled');
      } else if (data.post.status === 'draft') {
        navigate('/posts/drafts');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update post');
    },
  });

  // Handle form submission
  const handleSubmit = (values) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Error loading post</h2>
        <p className="mt-2 text-gray-500">{error.message}</p>
      </div>
    );
  }

  const post = data.post;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Post</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your {post.status === 'scheduled' ? 'scheduled' : 'draft'} post
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <PostForm
            initialValues={{
              content: post.content,
              mediaUrls: post.mediaUrls,
              platforms: post.platforms,
              scheduledAt: post.scheduledAt,
            }}
            onSubmit={handleSubmit}
            isEdit={true}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default EditPost;