import apiClient from './client';
import { ENDPOINTS } from '../config/api';

export const paymentAPI = {
  // Get wallet balance
  getWalletBalance: async () => {
    const response = await apiClient.get(ENDPOINTS.WALLET.BALANCE);
    return response.data;
  },

  // Get transaction history
  getTransactions: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.WALLET.TRANSACTIONS, { params });
    return response.data;
  },

  // Create wallet
  createWallet: async (walletData) => {
    const response = await apiClient.post('/wallet/create', walletData);
    return response.data;
  },

  // Add funds to wallet
  addFunds: async (amount, paymentMethod) => {
    const response = await apiClient.post('/wallet/add-funds', {
      amount,
      paymentMethod
    });
    return response.data;
  },

  // Process payment
  processPayment: async (paymentData) => {
    const response = await apiClient.post('/payment/process', paymentData);
    return response.data;
  },

  // Get payment methods
  getPaymentMethods: async () => {
    const response = await apiClient.get('/payment/methods');
    return response.data;
  },
}; 