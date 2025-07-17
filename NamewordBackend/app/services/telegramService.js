const axios = require('axios');
const { sanitizeHtml } = require('../utils/sanitizer');

/**
 * Secure Telegram Bot Service
 * Uses axios instead of vulnerable node-telegram-bot-api
 */
class TelegramService {
    constructor(token) {
        this.token = token;
        this.baseURL = `https://api.telegram.org/bot${token}`;
        
        // Create axios instance with security configurations
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000, // 10 second timeout
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'NamewordBot/1.0'
            },
            // Security configurations
            validateStatus: (status) => status < 500, // Don't throw on 4xx errors
            maxRedirects: 0, // Prevent redirect attacks
        });

        // Request interceptor for logging and validation
        this.client.interceptors.request.use((config) => {
            // Validate token format
            if (!this.token || this.token.length < 10) {
                throw new Error('Invalid Telegram bot token');
            }
            
            // Log requests in development
            if (process.env.NODE_ENV === 'development') {
                console.log(`Telegram API Request: ${config.method?.toUpperCase()} ${config.url}`);
            }
            
            return config;
        });

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('Telegram API Error:', error.message);
                
                // Handle specific error cases
                if (error.response?.status === 401) {
                    throw new Error('Invalid Telegram bot token');
                } else if (error.response?.status === 403) {
                    throw new Error('Telegram bot token does not have required permissions');
                } else if (error.response?.status === 429) {
                    throw new Error('Telegram API rate limit exceeded');
                }
                
                throw error;
            }
        );
    }

    /**
     * Send a text message to a chat
     * @param {string} chatId - The chat ID to send the message to
     * @param {string} text - The message text
     * @param {object} options - Additional options
     * @returns {Promise<object>} - The API response
     */
    async sendMessage(chatId, text, options = {}) {
        try {
            // Validate inputs
            if (!chatId || !text) {
                throw new Error('Chat ID and text are required');
            }

            // Sanitize the text to prevent injection attacks
            const sanitizedText = sanitizeHtml(text);

            // Prepare the request payload
            const payload = {
                chat_id: chatId,
                text: sanitizedText,
                parse_mode: options.parse_mode || 'Markdown',
                disable_web_page_preview: options.disable_web_page_preview || true,
                disable_notification: options.disable_notification || false,
                protect_content: options.protect_content || false
            };

            // Send the message
            const response = await this.client.post('/sendMessage', payload);
            
            if (response.data.ok) {
                console.log(`Message sent successfully to chat ${chatId}`);
                return response.data.result;
            } else {
                throw new Error(`Telegram API error: ${response.data.description}`);
            }
        } catch (error) {
            console.error('Error sending Telegram message:', error.message);
            throw error;
        }
    }

    /**
     * Send a message with Markdown formatting
     * @param {string} chatId - The chat ID
     * @param {string} text - The message text with Markdown
     * @returns {Promise<object>} - The API response
     */
    async sendMarkdownMessage(chatId, text) {
        return this.sendMessage(chatId, text, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
    }

    /**
     * Send a message with HTML formatting
     * @param {string} chatId - The chat ID
     * @param {string} text - The message text with HTML
     * @returns {Promise<object>} - The API response
     */
    async sendHtmlMessage(chatId, text) {
        return this.sendMessage(chatId, text, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
    }

    /**
     * Get bot information
     * @returns {Promise<object>} - Bot information
     */
    async getMe() {
        try {
            const response = await this.client.get('/getMe');
            
            if (response.data.ok) {
                return response.data.result;
            } else {
                throw new Error(`Telegram API error: ${response.data.description}`);
            }
        } catch (error) {
            console.error('Error getting bot info:', error.message);
            throw error;
        }
    }

    /**
     * Validate the bot token
     * @returns {Promise<boolean>} - True if token is valid
     */
    async validateToken() {
        try {
            await this.getMe();
            return true;
        } catch (error) {
            console.error('Invalid Telegram bot token:', error.message);
            return false;
        }
    }

    /**
     * Escape Markdown text to prevent injection
     * @param {string} text - The text to escape
     * @returns {string} - Escaped text
     */
    static escapeMarkdown(text) {
        if (!text) return '';
        
        return text
            .replace(/_/g, '\\_')
            .replace(/\*/g, '\\*')
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/~/g, '\\~')
            .replace(/`/g, '\\`')
            .replace(/>/g, '\\>')
            .replace(/#/g, '\\#')
            .replace(/\+/g, '\\+')
            .replace(/-/g, '\\-')
            .replace(/=/g, '\\=')
            .replace(/\|/g, '\\|')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/\./g, '\\.')
            .replace(/!/g, '\\!');
    }

    /**
     * Format credentials message securely
     * @param {object} credentials - The credentials object
     * @param {string} type - The type of credentials (WHM, Plesk, etc.)
     * @returns {string} - Formatted message
     */
    static formatCredentialsMessage(credentials, type = 'Credentials') {
        const safeInstanceName = TelegramService.escapeMarkdown(credentials.instanceName || '');
        const safeLoginUrl = credentials.loginUrl || '';
        const safeUsername = TelegramService.escapeMarkdown(credentials.username || '');
        const safePassword = TelegramService.escapeMarkdown(credentials.password || '');

        let message = `🔐 *${type}* 🔐\n\n`;
        message += `🖥 *Instance Name:* \`${safeInstanceName}\`\n`;
        message += `🌐 *URL:* [🔗 Click Here](${safeLoginUrl})\n\n`;

        if (safeUsername) {
            message += `👤 *Username:* \`${safeUsername}\`\n`;
        }

        if (safePassword) {
            message += `🔑 *Password:* \`${safePassword}\`\n\n`;
        }

        message += `⚠️ *Important:* Please change your password after logging in for security.\n\n`;
        message += `💡 Need help? Contact our support team.`;

        return message;
    }
}

module.exports = TelegramService; 