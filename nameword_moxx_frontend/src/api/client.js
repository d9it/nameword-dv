import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_CONFIG.API_KEY,
  },
  withCredentials: true, // IMPORTANT: sends cookies with request
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.token) {
        config.headers.Authorization = `Bearer ${userData.token}`;
      }
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('user');
          window.location.href = '/sign-in';
          break;
        case 403:
          // Forbidden
          console.error('❌ Access forbidden');
          break;
        case 404:
          // Not found
          console.error('❌ Resource not found');
          break;
        case 422:
          // Validation error
          console.error('❌ Validation error:', data);
          break;
        case 500:
          // Server error
          console.error('❌ Server error');
          break;
        default:
          console.error('❌ API Error:', status, data);
      }
    } else if (error.request) {
      // Network error
      console.error('❌ Network error:', error.message);
    } else {
      // Other error
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 