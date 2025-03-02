import api from '../services/api';

// Set auth token in axios headers
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Remove auth token from axios headers
export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};