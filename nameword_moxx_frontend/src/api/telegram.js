import apiClient from './apiClient';

// Telegram API
export const telegramApi = {
  // Notifications
  notifications: {
    // Send notification
    send: async (notificationData) => {
      try {
        const response = await apiClient.post('/api/telegram/notifications/send', notificationData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get notification history
    getHistory: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/telegram/notifications/history?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get notification by ID
    getById: async (notificationId) => {
      try {
        const response = await apiClient.get(`/api/telegram/notifications/${notificationId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Bot Configuration
  bot: {
    // Get bot configuration
    getConfig: async () => {
      try {
        const response = await apiClient.get('/api/telegram/bot/config');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update bot configuration
    updateConfig: async (configData) => {
      try {
        const response = await apiClient.put('/api/telegram/bot/config', configData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Test bot connection
    testConnection: async () => {
      try {
        const response = await apiClient.post('/api/telegram/bot/test');
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Webhooks
  webhooks: {
    // Get webhook URL
    getUrl: async () => {
      try {
        const response = await apiClient.get('/api/telegram/webhooks/url');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Set webhook URL
    setUrl: async (url) => {
      try {
        const response = await apiClient.post('/api/telegram/webhooks/url', { url });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete webhook
    delete: async () => {
      try {
        const response = await apiClient.delete('/api/telegram/webhooks/url');
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Chat Management
  chats: {
    // Get all chats
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/telegram/chats?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get chat details
    getById: async (chatId) => {
      try {
        const response = await apiClient.get(`/api/telegram/chats/${chatId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Send message to chat
    sendMessage: async (chatId, messageData) => {
      try {
        const response = await apiClient.post(`/api/telegram/chats/${chatId}/send`, messageData);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }
}; 