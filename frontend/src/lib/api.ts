import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for refresh token handling can be added here
api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const res = await axios.post('http://localhost:5000/api/auth/refresh', { token: refreshToken });
          
          if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
);

export default api;
