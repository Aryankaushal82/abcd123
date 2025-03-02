import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import PostForm from '../components/PostForm';
import { createPost } from '../services/postService';

const CreatePost = () => {
  const navigate = useNavigate();

  // Create post mutation
  const mutation = useMutation(createPost, {
    onSuccess: (data) => {
      toast.success('Post created successfully');
      if (data.post.status === 'scheduled') {
        navigate('/posts/scheduled');
      } else if (data.post.status === 'draft') {
        navigate('/posts/drafts');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
  });

  // Handle form submission
  const handleSubmit = (values) => {
    mutation.mutate(values);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create Post</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new post to share on your LinkedIn profile
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <PostForm
            initialValues={{
              content: '',
              mediaUrls: [],
              platforms: ['linkedin'],
              scheduledAt: null,
            }}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CreatePost;