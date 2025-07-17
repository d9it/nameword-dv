import apiClient from './apiClient';

// VPS Services API
export const vpsApi = {
  // VPS Plans
  plans: {
    // Get VPS plans
    getAll: async () => {
      try {
        const response = await apiClient.get('/api/vps/plans');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get VPS plan details
    getById: async (planId) => {
      try {
        const response = await apiClient.get(`/api/vps/plans/${planId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // VPS Instances
  instances: {
    // Get VPS instances
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/vps/instances?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get VPS instance details
    getById: async (instanceId) => {
      try {
        const response = await apiClient.get(`/api/vps/instances/${instanceId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create VPS instance
    create: async (instanceData) => {
      try {
        const response = await apiClient.post('/api/vps/instances', instanceData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update VPS instance
    update: async (instanceId, updateData) => {
      try {
        const response = await apiClient.put(`/api/vps/instances/${instanceId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete VPS instance
    delete: async (instanceId) => {
      try {
        const response = await apiClient.delete(`/api/vps/instances/${instanceId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Start VPS instance
    start: async (instanceId) => {
      try {
        const response = await apiClient.post(`/api/vps/instances/${instanceId}/start`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Stop VPS instance
    stop: async (instanceId) => {
      try {
        const response = await apiClient.post(`/api/vps/instances/${instanceId}/stop`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Restart VPS instance
    restart: async (instanceId) => {
      try {
        const response = await apiClient.post(`/api/vps/instances/${instanceId}/restart`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // VPS Disks
  disks: {
    // Get VPS disks
    getAll: async (instanceId, page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/vps/instances/${instanceId}/disks?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get VPS disk details
    getById: async (instanceId, diskId) => {
      try {
        const response = await apiClient.get(`/api/vps/instances/${instanceId}/disks/${diskId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create VPS disk
    create: async (instanceId, diskData) => {
      try {
        const response = await apiClient.post(`/api/vps/instances/${instanceId}/disks`, diskData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update VPS disk
    update: async (instanceId, diskId, updateData) => {
      try {
        const response = await apiClient.put(`/api/vps/instances/${instanceId}/disks/${diskId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete VPS disk
    delete: async (instanceId, diskId) => {
      try {
        const response = await apiClient.delete(`/api/vps/instances/${instanceId}/disks/${diskId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // VPS Billing Cycles
  billingCycles: {
    // Get VPS billing cycle discounts
    getDiscounts: async () => {
      try {
        const response = await apiClient.get('/api/vps/billing-cycle-discounts');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get VPS billing cycle discount by ID
    getDiscountById: async (discountId) => {
      try {
        const response = await apiClient.get(`/api/vps/billing-cycle-discounts/${discountId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Operating Systems
  operatingSystems: {
    // Get operating systems
    getAll: async () => {
      try {
        const response = await apiClient.get('/api/vps/operating-systems');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get operating system details
    getById: async (osId) => {
      try {
        const response = await apiClient.get(`/api/vps/operating-systems/${osId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }
}; 