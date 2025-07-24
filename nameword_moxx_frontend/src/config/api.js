// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
    : 'http://localhost:3000/api/v1',
  API_KEY: import.meta.env.VITE_API_KEY || 'YOUR_API_KEY_HERE',
  TIMEOUT: 30000 // 30 seconds
};

// Environment validation
export const validateEnvironment = () => {
  const required = ['VITE_API_BASE_URL', 'VITE_API_KEY'];
  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', missing);
    console.warn('Please check your .env file');
  }
};

// API endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    CURRENT_USER: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email-code',
    SEND_EMAIL_CODE: '/auth/send-email-code',
  },

  // Domain Management
  DOMAIN: {
    SEARCH: '/domain/search',
    SUGGESTIONS: '/domain/suggestion',
    TLD_SUGGESTIONS: '/domain/tld-suggestion',
    PRICE: '/domain/price',
    ORDER: '/domain/order',
    TRANSFER: '/domain/transfer',
    RENEW: '/domain/renew',
    LIST: '/domain/list',
  },

  // User Management
  USER: {
    PROFILE: '/user/profile',
    PASSWORD: '/user/password',
    DEACTIVATE: '/user/deactivate',
    DELETE: '/user/delete',
  },

  // Wallet & Transactions
  WALLET: {
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/transactions',
  },
}; 