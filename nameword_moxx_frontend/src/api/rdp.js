import apiClient from './apiClient';

// RDP Services API
export const rdpApi = {
  // RDP Plans
  plans: {
    // Get RDP plans
    getAll: async () => {
      try {
        const response = await apiClient.get('/api/rdp/plans');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get RDP plan details
    getById: async (planId) => {
      try {
        const response = await apiClient.get(`/api/rdp/plans/${planId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // RDP Instances
  instances: {
    // Get RDP instances
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/rdp/instances?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get RDP instance details
    getById: async (instanceId) => {
      try {
        const response = await apiClient.get(`/api/rdp/instances/${instanceId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create RDP instance
    create: async (instanceData) => {
      try {
        const response = await apiClient.post('/api/rdp/instances', instanceData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update RDP instance
    update: async (instanceId, updateData) => {
      try {
        const response = await apiClient.put(`/api/rdp/instances/${instanceId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete RDP instance
    delete: async (instanceId) => {
      try {
        const response = await apiClient.delete(`/api/rdp/instances/${instanceId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Start RDP instance
    start: async (instanceId) => {
      try {
        const response = await apiClient.post(`/api/rdp/instances/${instanceId}/start`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Stop RDP instance
    stop: async (instanceId) => {
      try {
        const response = await apiClient.post(`/api/rdp/instances/${instanceId}/stop`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Restart RDP instance
    restart: async (instanceId) => {
      try {
        const response = await apiClient.post(`/api/rdp/instances/${instanceId}/restart`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // RDP Subscriptions
  subscriptions: {
    // Get RDP subscriptions
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/rdp/subscriptions?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get RDP subscription details
    getById: async (subscriptionId) => {
      try {
        const response = await apiClient.get(`/api/rdp/subscriptions/${subscriptionId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create RDP subscription
    create: async (subscriptionData) => {
      try {
        const response = await apiClient.post('/api/rdp/subscriptions', subscriptionData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update RDP subscription
    update: async (subscriptionId, updateData) => {
      try {
        const response = await apiClient.put(`/api/rdp/subscriptions/${subscriptionId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Cancel RDP subscription
    cancel: async (subscriptionId) => {
      try {
        const response = await apiClient.post(`/api/rdp/subscriptions/${subscriptionId}/cancel`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Renew RDP subscription
    renew: async (subscriptionId) => {
      try {
        const response = await apiClient.post(`/api/rdp/subscriptions/${subscriptionId}/renew`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // RDP Billing Cycles
  billingCycles: {
    // Get RDP billing cycle discounts
    getDiscounts: async () => {
      try {
        const response = await apiClient.get('/api/rdp/billing-cycle-discounts');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get RDP billing cycle discount by ID
    getDiscountById: async (discountId) => {
      try {
        const response = await apiClient.get(`/api/rdp/billing-cycle-discounts/${discountId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // RDP Email
  email: {
    // Get RDP email settings
    getSettings: async (instanceId) => {
      try {
        const response = await apiClient.get(`/api/rdp/instances/${instanceId}/email`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update RDP email settings
    updateSettings: async (instanceId, emailData) => {
      try {
        const response = await apiClient.put(`/api/rdp/instances/${instanceId}/email`, emailData);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }
}; 