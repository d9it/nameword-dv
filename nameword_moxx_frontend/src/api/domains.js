import apiClient from './client';
import { ENDPOINTS } from '../config/api';

export const domainAPI = {
  // Search domain availability
  searchDomain: async (params) => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.SEARCH, { params });
    return response.data;
  },

  // Get domain suggestions
  getSuggestions: async (params) => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.SUGGESTIONS, { params });
    return response.data;
  },

  // Get TLD suggestions
  getTldSuggestions: async (params) => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.TLD_SUGGESTIONS, { params });
    return response.data;
  },

  // Check domain price
  checkPrice: async (params) => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.PRICE, { params });
    return response.data;
  },

  // Order domain
  orderDomain: async (params) => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.ORDER, { params });
    return response.data;
  },

  // Transfer domain
  transferDomain: async (params) => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.TRANSFER, { params });
    return response.data;
  },

  // Renew domain
  renewDomain: async (params) => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.RENEW, { params });
    return response.data;
  },

  // Get user's domain list
  getDomainList: async () => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.LIST);
    return response.data;
  },
}; 