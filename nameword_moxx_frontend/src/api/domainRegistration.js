import apiClient from './client';
import { ENDPOINTS } from '../config/api';

export const domainRegistrationAPI = {
  // Order domain
  orderDomain: async (orderData) => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.ORDER, { 
      params: orderData 
    });
    return response.data;
  },

  // Transfer domain
  transferDomain: async (transferData) => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.TRANSFER, { 
      params: transferData 
    });
    return response.data;
  },

  // Renew domain
  renewDomain: async (renewData) => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.RENEW, { 
      params: renewData 
    });
    return response.data;
  },

  // Get domain price
  getDomainPrice: async (domainName, provider = 'openprovider') => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.PRICE, { 
      params: { websiteName: domainName, provider } 
    });
    return response.data;
  },

  // Get TLD suggestions
  getTldSuggestions: async (domainName, provider = 'openprovider') => {
    const response = await apiClient.get(ENDPOINTS.DOMAIN.TLD_SUGGESTIONS, { 
      params: { websiteName: domainName, provider } 
    });
    return response.data;
  },
}; 