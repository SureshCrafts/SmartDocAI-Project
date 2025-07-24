// frontend/src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5001/api/';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: A response interceptor for handling global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export default api;