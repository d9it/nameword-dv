/**
 * Comprehensive Input Sanitization Utility
 * 
 * This utility provides comprehensive input sanitization to prevent
 * XSS, injection attacks, and other security vulnerabilities.
 */

const crypto = require('crypto');
const { body, query, param } = require('express-validator');
const { Logger } = require('./logger');

class ComprehensiveSanitizer {
    
    /**
     * Sanitize HTML content to prevent XSS attacks
     * @param {string} input - The input string to sanitize
     * @returns {string} - Sanitized string
     */
    static sanitizeHtml(input) {
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
            .replace(/\//g, '&#x2F;')
            // Additional security measures
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
    }

    /**
     * Sanitize URL to prevent XSS and SSRF attacks
     * @param {string} url - The URL to sanitize
     * @returns {string} - Sanitized URL or empty string if invalid
     */
    static sanitizeUrl(url) {
        if (!url || typeof url !== 'string') {
            return '';
        }
        
        try {
            const urlObj = new URL(url);
            
            // Only allow http and https protocols
            if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
                return '';
            }
            
            // Prevent SSRF attacks
            const dangerousHosts = [
                'localhost', '127.0.0.1', '0.0.0.0', '::1',
                '10.0.0.0', '172.16.0.0', '192.168.0.0'
            ];
            
            if (dangerousHosts.includes(urlObj.hostname.toLowerCase())) {
                return '';
            }
            
            return url;
        } catch (error) {
            return '';
        }
    }

    /**
     * Sanitize SQL injection patterns
     * @param {string} input - The input string to sanitize
     * @returns {string} - Sanitized string
     */
    static sanitizeSql(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        
        // Remove SQL injection patterns
        return input
            .replace(/['";]/g, '')
            .replace(/--/g, '')
            .replace(/\/\*/g, '')
            .replace(/\*\//g, '')
            .replace(/union\s+select/gi, '')
            .replace(/drop\s+table/gi, '')
            .replace(/delete\s+from/gi, '')
            .replace(/insert\s+into/gi, '')
            .replace(/update\s+set/gi, '')
            .replace(/exec\s*\(/gi, '')
            .replace(/xp_cmdshell/gi, '');
    }

    /**
     * Sanitize NoSQL injection patterns
     * @param {string} input - The input string to sanitize
     * @returns {string} - Sanitized string
     */
    static sanitizeNoSql(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        
        // Remove NoSQL injection patterns
        return input
            .replace(/\$where/gi, '')
            .replace(/\$ne/gi, '')
            .replace(/\$gt/gi, '')
            .replace(/\$lt/gi, '')
            .replace(/\$gte/gi, '')
            .replace(/\$lte/gi, '')
            .replace(/\$in/gi, '')
            .replace(/\$nin/gi, '')
            .replace(/\$regex/gi, '')
            .replace(/\$options/gi, '');
    }

    /**
     * Sanitize command injection patterns
     * @param {string} input - The input string to sanitize
     * @returns {string} - Sanitized string
     */
    static sanitizeCommand(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        
        // Remove command injection patterns
        return input
            .replace(/[;&|`$()]/g, '')
            .replace(/\$\{/g, '')
            .replace(/\$\w+/g, '')
            .replace(/eval\s*\(/gi, '')
            .replace(/exec\s*\(/gi, '')
            .replace(/system\s*\(/gi, '')
            .replace(/spawn\s*\(/gi, '')
            .replace(/execSync\s*\(/gi, '');
    }

    /**
     * Sanitize file path to prevent path traversal attacks
     * @param {string} input - The input string to sanitize
     * @returns {string} - Sanitized string
     */
    static sanitizePath(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        
        // Remove path traversal patterns
        return input
            .replace(/\.\./g, '')
            .replace(/\/\//g, '/')
            .replace(/\\/g, '/')
            .replace(/[<>:"|?*]/g, '');
    }

    /**
     * Sanitize email to prevent email injection
     * @param {string} input - The input string to sanitize
     * @returns {string} - Sanitized string
     */
    static sanitizeEmail(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        
        // Remove email injection patterns
        return input
            .replace(/[\r\n]/g, '')
            .replace(/[<>\"'&]/g, '')
            .replace(/bcc:/gi, '')
            .replace(/cc:/gi, '')
            .replace(/to:/gi, '')
            .replace(/subject:/gi, '')
            .replace(/content-type:/gi, '')
            .replace(/mime-version:/gi, '');
    }

    /**
     * Comprehensive sanitization for all input types
     * @param {string} input - The input string to sanitize
     * @param {string} type - The type of input ('html', 'url', 'sql', 'nosql', 'command', 'path', 'email')
     * @returns {string} - Sanitized string
     */
    static sanitize(input, type = 'html') {
        if (!input || typeof input !== 'string') {
            return '';
        }

        let sanitized = input;

        // Apply type-specific sanitization
        switch (type) {
            case 'url':
                sanitized = this.sanitizeUrl(sanitized);
                break;
            case 'sql':
                sanitized = this.sanitizeSql(sanitized);
                break;
            case 'nosql':
                sanitized = this.sanitizeNoSql(sanitized);
                break;
            case 'command':
                sanitized = this.sanitizeCommand(sanitized);
                break;
            case 'path':
                sanitized = this.sanitizePath(sanitized);
                break;
            case 'email':
                sanitized = this.sanitizeEmail(sanitized);
                break;
            case 'html':
            default:
                sanitized = this.sanitizeHtml(sanitized);
                break;
        }

        // Always apply basic HTML sanitization as a final step
        sanitized = this.sanitizeHtml(sanitized);

        return sanitized;
    }

    /**
     * Sanitize request object comprehensively
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     * @param {function} next - Express next function
     */
    static sanitizeRequest(req, res, next) {
        try {
            // Sanitize body parameters
            if (req.body) {
                this.sanitizeObject(req.body);
            }

            // Sanitize query parameters
            if (req.query) {
                this.sanitizeObject(req.query);
            }

            // Sanitize URL parameters
            if (req.params) {
                this.sanitizeObject(req.params);
            }

            // Sanitize headers (except essential ones)
            if (req.headers) {
                const essentialHeaders = ['authorization', 'content-type', 'content-length', 'user-agent', 'accept', 'host'];
                Object.keys(req.headers).forEach(key => {
                    if (!essentialHeaders.includes(key.toLowerCase())) {
                        if (typeof req.headers[key] === 'string') {
                            req.headers[key] = this.sanitize(req.headers[key], 'html');
                        }
                    }
                });
            }

            next();
        } catch (error) {
            Logger.error('Sanitization error:', error);
            next();
        }
    }

    /**
     * Sanitize object recursively
     * @param {object} obj - Object to sanitize
     * @param {string} type - Sanitization type
     */
    static sanitizeObject(obj, type = 'html') {
        if (!obj || typeof obj !== 'object') {
            return;
        }

        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                // Determine sanitization type based on field name
                let sanitizationType = type;
                
                if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
                    sanitizationType = 'url';
                } else if (key.toLowerCase().includes('email') || key.toLowerCase().includes('mail')) {
                    sanitizationType = 'email';
                } else if (key.toLowerCase().includes('path') || key.toLowerCase().includes('file')) {
                    sanitizationType = 'path';
                } else if (key.toLowerCase().includes('sql') || key.toLowerCase().includes('query')) {
                    sanitizationType = 'sql';
                } else if (key.toLowerCase().includes('command') || key.toLowerCase().includes('exec')) {
                    sanitizationType = 'command';
                }

                obj[key] = this.sanitize(obj[key], sanitizationType);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.sanitizeObject(obj[key], type);
            }
        });
    }

    /**
     * Generate validation rules for express-validator with sanitization
     * @param {string} field - Field name
     * @param {string} location - 'body', 'query', or 'param'
     * @param {object} options - Validation options
     * @returns {array} Validation rules
     */
    static getValidationRules(field, location = 'body', options = {}) {
        const { type = 'html', required = true, minLength = 1, maxLength = 255 } = options;
        const validator = location === 'body' ? body : location === 'query' ? query : param;
        
        let rules = [
            validator(field).trim()
        ];

        if (required) {
            rules.push(validator(field).notEmpty().withMessage(`${field} is required`));
        }

        rules.push(
            validator(field).isLength({ min: minLength, max: maxLength })
                .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`)
        );

        // Add type-specific validation
        rules.push(
            validator(field).custom((value) => {
                if (value) {
                    const sanitized = this.sanitize(value, type);
                    if (sanitized !== value) {
                        throw new Error(`${field} contains invalid characters`);
                    }
                }
                return true;
            })
        );

        return rules;
    }

    /**
     * Generate secure random string for nonces
     * @param {number} length - Length of the random string
     * @returns {string} - Random string
     */
    static generateNonce(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Validate and sanitize file upload
     * @param {object} file - File object
     * @param {object} options - Validation options
     * @returns {object} - Validation result
     */
    static validateFile(file, options = {}) {
        const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;
        
        const result = {
            isValid: true,
            errors: []
        };

        if (!file) {
            result.isValid = false;
            result.errors.push('File is required');
            return result;
        }

        // Check file size
        if (file.size > maxSize) {
            result.isValid = false;
            result.errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        }

        // Check file type
        if (allowedTypes.length > 0) {
            const fileType = file.mimetype || file.type;
            if (!allowedTypes.includes(fileType)) {
                result.isValid = false;
                result.errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
            }
        }

        // Check file extension
        if (allowedExtensions.length > 0) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                result.isValid = false;
                result.errors.push(`File extension must be one of: ${allowedExtensions.join(', ')}`);
            }
        }

        // Check for dangerous extensions
        const dangerousExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'msi'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (dangerousExtensions.includes(fileExtension)) {
            result.isValid = false;
            result.errors.push('File type is not allowed for security reasons');
        }

        return result;
    }
}

module.exports = ComprehensiveSanitizer; 