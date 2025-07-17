import Axios from 'axios'

const axios = Axios.create({
  //baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
})

// Request interceptor to add CSRF token
axios.interceptors.request.use(async (config) => {
  // Add CSRF token for state-changing requests
  if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
    try {
      const response = await axios.get('/api/auth/csrf-token', {
        withCredentials: true
      });
      config.headers['X-CSRF-Token'] = response.data.data.token;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }
  return config;
});

// Response interceptor to handle CSRF errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.error === 'CSRF_ERROR') {
      // Handle CSRF error - refresh the page
      console.error('CSRF token validation failed');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default axios