import apiClient from './apiClient';

// Admin API
export const adminApi = {
  // User Management
  users: {
    // Get all users
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/admin/users?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get user details
    getById: async (userId) => {
      try {
        const response = await apiClient.get(`/api/admin/users/${userId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create user
    create: async (userData) => {
      try {
        const response = await apiClient.post('/api/admin/users', userData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update user
    update: async (userId, updateData) => {
      try {
        const response = await apiClient.put(`/api/admin/users/${userId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete user
    delete: async (userId) => {
      try {
        const response = await apiClient.delete(`/api/admin/users/${userId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Suspend user
    suspend: async (userId) => {
      try {
        const response = await apiClient.post(`/api/admin/users/${userId}/suspend`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Activate user
    activate: async (userId) => {
      try {
        const response = await apiClient.post(`/api/admin/users/${userId}/activate`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // System Settings
  settings: {
    // Get system settings
    getAll: async () => {
      try {
        const response = await apiClient.get('/api/admin/settings');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get setting by key
    getByKey: async (key) => {
      try {
        const response = await apiClient.get(`/api/admin/settings/${key}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update system setting
    update: async (key, value) => {
      try {
        const response = await apiClient.put(`/api/admin/settings/${key}`, { value });
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Membership Tiers
  membershipTiers: {
    // Get all membership tiers
    getAll: async () => {
      try {
        const response = await apiClient.get('/api/admin/membership-tiers');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get membership tier details
    getById: async (tierId) => {
      try {
        const response = await apiClient.get(`/api/admin/membership-tiers/${tierId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create membership tier
    create: async (tierData) => {
      try {
        const response = await apiClient.post('/api/admin/membership-tiers', tierData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update membership tier
    update: async (tierId, updateData) => {
      try {
        const response = await apiClient.put(`/api/admin/membership-tiers/${tierId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete membership tier
    delete: async (tierId) => {
      try {
        const response = await apiClient.delete(`/api/admin/membership-tiers/${tierId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // cPanel Plans
  cpanelPlans: {
    // Get all cPanel plans
    getAll: async () => {
      try {
        const response = await apiClient.get('/api/admin/cpanel-plans');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get cPanel plan details
    getById: async (planId) => {
      try {
        const response = await apiClient.get(`/api/admin/cpanel-plans/${planId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create cPanel plan
    create: async (planData) => {
      try {
        const response = await apiClient.post('/api/admin/cpanel-plans', planData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update cPanel plan
    update: async (planId, updateData) => {
      try {
        const response = await apiClient.put(`/api/admin/cpanel-plans/${planId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete cPanel plan
    delete: async (planId) => {
      try {
        const response = await apiClient.delete(`/api/admin/cpanel-plans/${planId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // System Statistics
  stats: {
    // Get system statistics
    getSystemStats: async () => {
      try {
        const response = await apiClient.get('/api/admin/stats/system');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get user statistics
    getUserStats: async () => {
      try {
        const response = await apiClient.get('/api/admin/stats/users');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get revenue statistics
    getRevenueStats: async () => {
      try {
        const response = await apiClient.get('/api/admin/stats/revenue');
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Activity Logs
  activityLogs: {
    // Get activity logs
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/admin/activity-logs?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get activity log details
    getById: async (logId) => {
      try {
        const response = await apiClient.get(`/api/admin/activity-logs/${logId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }
}; 