import apiClient from './apiClient';

// User Profile API
export const userProfileApi = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/api/user/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.put('/api/user/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user activity
  getActivity: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/api/user/activity?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update notification preferences
  updateNotifications: async (notificationSettings) => {
    try {
      const response = await apiClient.put('/api/user/notifications', notificationSettings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get notification preferences
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/api/user/notifications');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 