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
    const formData = new FormData();
    
    // Add user data to form
    Object.keys(userData).forEach(key => {
      if (key !== 'profileImg') {
        formData.append(key, userData[key]);
      }
    });
    
    // Add profile image if provided
    if (userData.profileImg) {
      formData.append('profileImg', userData.profileImg);
    }
    
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  // Reset password
  resetPassword: async (resetData) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, resetData);
    return response.data;
  },

  // Send email verification code
  sendEmailCode: async (email) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.SEND_EMAIL_CODE, { email });
    return response.data;
  },

  // Verify email code
  verifyEmailCode: async (verificationData) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_EMAIL, verificationData);
    return response.data;
  },

  // Send mobile OTP
  sendMobileOtp: async (mobileData) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.SEND_MOBILE_OTP, mobileData);
    return response.data;
  },

  // Verify mobile OTP
  verifyMobileOtp: async (otpData) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_MOBILE_OTP, otpData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
    return response.data;
  },

  // Update user details
  updateUserDetails: async (userData) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.UPDATE_USER_DETAILS, userData);
    return response.data;
  },

  // Deactivate account
  deactivateAccount: async () => {
    const response = await apiClient.post(ENDPOINTS.AUTH.DEACTIVATE_ACCOUNT);
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await apiClient.delete(ENDPOINTS.AUTH.DELETE_ACCOUNT);
    return response.data;
  },

  // Request account reactivation
  requestReactivate: async (email) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REQUEST_REACTIVATE, { email });
    return response.data;
  },

  // Reactivate account
  reactivateAccount: async (reactivateData) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REACTIVATE_ACCOUNT, reactivateData);
    return response.data;
  },

  // Update profile picture
  updateProfilePicture: async (profileImg) => {
    const formData = new FormData();
    formData.append('profileImg', profileImg);
    
    const response = await apiClient.post(ENDPOINTS.AUTH.UPDATE_PROFILE_PICTURE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    const response = await apiClient.post(ENDPOINTS.AUTH.DELETE_PROFILE_PICTURE);
    return response.data;
  },
}; 