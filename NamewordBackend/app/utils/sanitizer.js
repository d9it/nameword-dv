const crypto = require('crypto');

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized HTML string
 */
const sanitizeHtml = (input) => {
    if (!input || typeof input !== 'string') {
        return '';
    }
    
    // Remove all HTML tags and entities
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize URL to prevent XSS and ensure it's a valid URL
 * @param {string} url - The URL to sanitize
 * @returns {string} - Sanitized URL or empty string if invalid
 */
const sanitizeUrl = (url) => {
    if (!url || typeof url !== 'string') {
        return '';
    }
    
    try {
        // Basic URL validation
        const urlObj = new URL(url);
        // Only allow http and https protocols
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            return '';
        }
        return url;
    } catch (error) {
        // If URL is invalid, return empty string
        return '';
    }
};

/**
 * Sanitize user data for email templates
 * @param {object} data - The data object to sanitize
 * @returns {object} - Sanitized data object
 */
const sanitizeEmailData = (data) => {
    if (!data || typeof data !== 'object') {
        return {};
    }
    
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            // Special handling for URLs
            if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
                sanitized[key] = sanitizeUrl(value);
            } else {
                sanitized[key] = sanitizeHtml(value);
            }
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeEmailData(value);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
};

/**
 * Generate a secure random string for nonces
 * @param {number} length - Length of the random string
 * @returns {string} - Random string
 */
const generateNonce = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

module.exports = {
    sanitizeHtml,
    sanitizeUrl,
    sanitizeEmailData,
    generateNonce
}; 