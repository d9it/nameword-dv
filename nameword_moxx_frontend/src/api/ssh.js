import apiClient from './apiClient';

// SSH Keys API
export const sshApi = {
  // Get SSH keys
  getAll: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/api/ssh-keys?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get SSH key details
  getById: async (keyId) => {
    try {
      const response = await apiClient.get(`/api/ssh-keys/${keyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create SSH key
  create: async (keyData) => {
    try {
      const response = await apiClient.post('/api/ssh-keys', keyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update SSH key
  update: async (keyId, updateData) => {
    try {
      const response = await apiClient.put(`/api/ssh-keys/${keyId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete SSH key
  delete: async (keyId) => {
    try {
      const response = await apiClient.delete(`/api/ssh-keys/${keyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Test SSH key connection
  testConnection: async (keyId) => {
    try {
      const response = await apiClient.post(`/api/ssh-keys/${keyId}/test`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 