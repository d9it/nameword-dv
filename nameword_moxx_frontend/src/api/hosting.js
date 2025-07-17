import apiClient from './apiClient';

// Hosting Services API
export const hostingApi = {
  // cPanel Hosting
  cpanel: {
    // Get cPanel plans
    getPlans: async () => {
      try {
        const response = await apiClient.get('/api/hosting/cpanel/plans');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create cPanel account
    createAccount: async (accountData) => {
      try {
        const response = await apiClient.post('/api/hosting/cpanel/accounts', accountData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get cPanel accounts
    getAccounts: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/hosting/cpanel/accounts?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get cPanel account details
    getAccount: async (accountId) => {
      try {
        const response = await apiClient.get(`/api/hosting/cpanel/accounts/${accountId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update cPanel account
    updateAccount: async (accountId, updateData) => {
      try {
        const response = await apiClient.put(`/api/hosting/cpanel/accounts/${accountId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete cPanel account
    deleteAccount: async (accountId) => {
      try {
        const response = await apiClient.delete(`/api/hosting/cpanel/accounts/${accountId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Plesk Hosting
  plesk: {
    // Get Plesk plans
    getPlans: async () => {
      try {
        const response = await apiClient.get('/api/hosting/plesk/plans');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create Plesk account
    createAccount: async (accountData) => {
      try {
        const response = await apiClient.post('/api/hosting/plesk/accounts', accountData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get Plesk accounts
    getAccounts: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/hosting/plesk/accounts?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get Plesk account details
    getAccount: async (accountId) => {
      try {
        const response = await apiClient.get(`/api/hosting/plesk/accounts/${accountId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Cloudflare Hosting
  cloudflare: {
    // Get Cloudflare zones
    getZones: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/hosting/cloudflare/zones?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create Cloudflare zone
    createZone: async (zoneData) => {
      try {
        const response = await apiClient.post('/api/hosting/cloudflare/zones', zoneData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get Cloudflare zone details
    getZone: async (zoneId) => {
      try {
        const response = await apiClient.get(`/api/hosting/cloudflare/zones/${zoneId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update Cloudflare zone
    updateZone: async (zoneId, updateData) => {
      try {
        const response = await apiClient.put(`/api/hosting/cloudflare/zones/${zoneId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }
}; 