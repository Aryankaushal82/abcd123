import api from './api';

// Get all posts with optional filters
export const getPosts = async ({ status, page = 1, limit = 10 }) => {
  const response = await api.get('/api/posts', {
    params: { status, page, limit },
  });
  return response.data;
};

// Get a single post by ID
export const getPost = async (id) => {
  const response = await api.get(`/api/posts/${id}`);
  return response.data;
};

// Create a new post
export const createPost = async (postData) => {
  const response = await api.post('/api/posts', postData);
  return response.data;
};

// Update an existing post
export const updatePost = async (id, postData) => {
  const response = await api.put(`/api/posts/${id}`, postData);
  return response.data;
};

// Delete a post
export const deletePost = async (id) => {
  const response = await api.delete(`/api/posts/${id}`);
  return response.data;
};

// Get scheduled posts
export const getScheduledPosts = async ({ page = 1, limit = 10 }) => {
  const response = await api.get('/api/scheduled-posts', {
    params: { page, limit },
  });
  return response.data;
};

// Cancel a scheduled post
export const cancelScheduledPost = async (id) => {
  const response = await api.delete(`/api/scheduled-posts/${id}`);
  return response.data;
};

// Publish a post immediately
export const publishNow = async (id) => {
  const response = await api.post(`/api/posts/${id}/publish-now`);
  return response.data;
};