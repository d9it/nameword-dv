import apiClient from './apiClient';

// Firewall API
export const firewallApi = {
  // Get firewall rules
  getRules: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/api/firewall/rules?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get firewall rule details
  getRuleById: async (ruleId) => {
    try {
      const response = await apiClient.get(`/api/firewall/rules/${ruleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create firewall rule
  createRule: async (ruleData) => {
    try {
      const response = await apiClient.post('/api/firewall/rules', ruleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update firewall rule
  updateRule: async (ruleId, updateData) => {
    try {
      const response = await apiClient.put(`/api/firewall/rules/${ruleId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete firewall rule
  deleteRule: async (ruleId) => {
    try {
      const response = await apiClient.delete(`/api/firewall/rules/${ruleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Enable firewall rule
  enableRule: async (ruleId) => {
    try {
      const response = await apiClient.post(`/api/firewall/rules/${ruleId}/enable`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Disable firewall rule
  disableRule: async (ruleId) => {
    try {
      const response = await apiClient.post(`/api/firewall/rules/${ruleId}/disable`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get firewall policies
  getPolicies: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/api/firewall/policies?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get firewall policy details
  getPolicyById: async (policyId) => {
    try {
      const response = await apiClient.get(`/api/firewall/policies/${policyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create firewall policy
  createPolicy: async (policyData) => {
    try {
      const response = await apiClient.post('/api/firewall/policies', policyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update firewall policy
  updatePolicy: async (policyId, updateData) => {
    try {
      const response = await apiClient.put(`/api/firewall/policies/${policyId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete firewall policy
  deletePolicy: async (policyId) => {
    try {
      const response = await apiClient.delete(`/api/firewall/policies/${policyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get firewall statistics
  getStats: async () => {
    try {
      const response = await apiClient.get('/api/firewall/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 