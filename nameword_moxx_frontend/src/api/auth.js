import apiClient from './client';
import { ENDPOINTS } from '../config/api';

export const authAPI = {
  // User login
  login: async (credentials) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  // User registration
  register: async (userData) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  // User logout
  logout: async () => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get(ENDPOINTS.AUTH.CURRENT_USER);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (resetData) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, resetData);
    return response.data;
  },

  // Verify email
  verifyEmail: async (verificationData) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_EMAIL, verificationData);
    return response.data;
  },
}; 