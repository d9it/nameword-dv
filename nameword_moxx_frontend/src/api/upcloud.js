import apiClient from './apiClient';

// UpCloud API
export const upcloudApi = {
  // Servers
  servers: {
    // Get UpCloud servers
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/upcloud/servers?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get UpCloud server details
    getById: async (serverId) => {
      try {
        const response = await apiClient.get(`/api/upcloud/servers/${serverId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create UpCloud server
    create: async (serverData) => {
      try {
        const response = await apiClient.post('/api/upcloud/servers', serverData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update UpCloud server
    update: async (serverId, updateData) => {
      try {
        const response = await apiClient.put(`/api/upcloud/servers/${serverId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete UpCloud server
    delete: async (serverId) => {
      try {
        const response = await apiClient.delete(`/api/upcloud/servers/${serverId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Start UpCloud server
    start: async (serverId) => {
      try {
        const response = await apiClient.post(`/api/upcloud/servers/${serverId}/start`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Stop UpCloud server
    stop: async (serverId) => {
      try {
        const response = await apiClient.post(`/api/upcloud/servers/${serverId}/stop`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Restart UpCloud server
    restart: async (serverId) => {
      try {
        const response = await apiClient.post(`/api/upcloud/servers/${serverId}/restart`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Storage
  storage: {
    // Get UpCloud storage
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/upcloud/storage?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get UpCloud storage details
    getById: async (storageId) => {
      try {
        const response = await apiClient.get(`/api/upcloud/storage/${storageId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create UpCloud storage
    create: async (storageData) => {
      try {
        const response = await apiClient.post('/api/upcloud/storage', storageData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update UpCloud storage
    update: async (storageId, updateData) => {
      try {
        const response = await apiClient.put(`/api/upcloud/storage/${storageId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete UpCloud storage
    delete: async (storageId) => {
      try {
        const response = await apiClient.delete(`/api/upcloud/storage/${storageId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Attach storage to server
    attach: async (storageId, serverId) => {
      try {
        const response = await apiClient.post(`/api/upcloud/storage/${storageId}/attach`, { serverId });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Detach storage from server
    detach: async (storageId, serverId) => {
      try {
        const response = await apiClient.post(`/api/upcloud/storage/${storageId}/detach`, { serverId });
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Networks
  networks: {
    // Get UpCloud networks
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/upcloud/networks?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get UpCloud network details
    getById: async (networkId) => {
      try {
        const response = await apiClient.get(`/api/upcloud/networks/${networkId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create UpCloud network
    create: async (networkData) => {
      try {
        const response = await apiClient.post('/api/upcloud/networks', networkData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update UpCloud network
    update: async (networkId, updateData) => {
      try {
        const response = await apiClient.put(`/api/upcloud/networks/${networkId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete UpCloud network
    delete: async (networkId) => {
      try {
        const response = await apiClient.delete(`/api/upcloud/networks/${networkId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Plans
  plans: {
    // Get UpCloud plans
    getAll: async () => {
      try {
        const response = await apiClient.get('/api/upcloud/plans');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get UpCloud plan details
    getById: async (planId) => {
      try {
        const response = await apiClient.get(`/api/upcloud/plans/${planId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }
}; 