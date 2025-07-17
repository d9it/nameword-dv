/**
 * Comprehensive Input Sanitization Middleware
 * 
 * This middleware provides comprehensive input sanitization to prevent
 * XSS, injection attacks, and other security vulnerabilities.
 */

const ComprehensiveSanitizer = require('../utils/comprehensiveSanitizer');
const { Logger } = require('../utils/logger');

/**
 * Comprehensive input sanitization middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const comprehensiveInputSanitization = (req, res, next) => {
    try {
        // Sanitize all request data
        ComprehensiveSanitizer.sanitizeRequest(req, res, next);
    } catch (error) {
        Logger.error('Comprehensive sanitization error:', error);
        // Continue with request even if sanitization fails
        next();
    }
};

/**
 * Route-specific sanitization middleware
 * @param {string} type - Sanitization type ('html', 'url', 'sql', 'nosql', 'command', 'path', 'email')
 * @returns {function} Middleware function
 */
const routeSpecificSanitization = (type = 'html') => {
    return (req, res, next) => {
        try {
            // Sanitize body parameters with specific type
            if (req.body) {
                ComprehensiveSanitizer.sanitizeObject(req.body, type);
            }

            // Sanitize query parameters with specific type
            if (req.query) {
                ComprehensiveSanitizer.sanitizeObject(req.query, type);
            }

            // Sanitize URL parameters with specific type
            if (req.params) {
                ComprehensiveSanitizer.sanitizeObject(req.params, type);
            }

            next();
        } catch (error) {
            Logger.error('Route-specific sanitization error:', error);
            next();
        }
    };
};

/**
 * Field-specific sanitization middleware
 * @param {string} field - Field name to sanitize
 * @param {string} type - Sanitization type
 * @returns {function} Middleware function
 */
const fieldSpecificSanitization = (field, type = 'html') => {
    return (req, res, next) => {
        try {
            // Sanitize specific field in body
            if (req.body && req.body[field] && typeof req.body[field] === 'string') {
                req.body[field] = ComprehensiveSanitizer.sanitize(req.body[field], type);
            }

            // Sanitize specific field in query
            if (req.query && req.query[field] && typeof req.query[field] === 'string') {
                req.query[field] = ComprehensiveSanitizer.sanitize(req.query[field], type);
            }

            // Sanitize specific field in params
            if (req.params && req.params[field] && typeof req.params[field] === 'string') {
                req.params[field] = ComprehensiveSanitizer.sanitize(req.params[field], type);
            }

            next();
        } catch (error) {
            Logger.error('Field-specific sanitization error:', error);
            next();
        }
    };
};

/**
 * File upload sanitization middleware
 * @param {object} options - Validation options
 * @returns {function} Middleware function
 */
const fileUploadSanitization = (options = {}) => {
    return (req, res, next) => {
        try {
            if (req.files) {
                Object.keys(req.files).forEach(fieldName => {
                    const file = req.files[fieldName];
                    if (file) {
                        // Validate file
                        const validation = ComprehensiveSanitizer.validateFile(file, options);
                        if (!validation.isValid) {
                            return res.status(400).json({
                                success: false,
                                message: 'File validation failed',
                                errors: validation.errors
                            });
                        }

                        // Sanitize filename
                        if (file.name) {
                            file.name = ComprehensiveSanitizer.sanitize(file.name, 'path');
                        }
                    }
                });
            }

            next();
        } catch (error) {
            Logger.error('File upload sanitization error:', error);
            next();
        }
    };
};

/**
 * API-specific sanitization middleware
 * @returns {function} Middleware function
 */
const apiSanitization = () => {
    return (req, res, next) => {
        try {
            // Enhanced sanitization for API routes
            if (req.body) {
                // Sanitize common API fields
                const apiFields = ['name', 'description', 'title', 'content', 'message', 'comment'];
                apiFields.forEach(field => {
                    if (req.body[field] && typeof req.body[field] === 'string') {
                        req.body[field] = ComprehensiveSanitizer.sanitize(req.body[field], 'html');
                    }
                });

                // Sanitize URL fields
                const urlFields = ['url', 'link', 'website', 'redirect'];
                urlFields.forEach(field => {
                    if (req.body[field] && typeof req.body[field] === 'string') {
                        req.body[field] = ComprehensiveSanitizer.sanitize(req.body[field], 'url');
                    }
                });

                // Sanitize email fields
                const emailFields = ['email', 'mail', 'contact'];
                emailFields.forEach(field => {
                    if (req.body[field] && typeof req.body[field] === 'string') {
                        req.body[field] = ComprehensiveSanitizer.sanitize(req.body[field], 'email');
                    }
                });
            }

            next();
        } catch (error) {
            Logger.error('API sanitization error:', error);
            next();
        }
    };
};

/**
 * Admin-specific sanitization middleware
 * @returns {function} Middleware function
 */
const adminSanitization = () => {
    return (req, res, next) => {
        try {
            // Stricter sanitization for admin routes
            if (req.body) {
                // Sanitize all string fields with HTML sanitization
                Object.keys(req.body).forEach(key => {
                    if (typeof req.body[key] === 'string') {
                        req.body[key] = ComprehensiveSanitizer.sanitize(req.body[key], 'html');
                    }
                });
            }

            // Sanitize query parameters
            if (req.query) {
                Object.keys(req.query).forEach(key => {
                    if (typeof req.query[key] === 'string') {
                        req.query[key] = ComprehensiveSanitizer.sanitize(req.query[key], 'html');
                    }
                });
            }

            next();
        } catch (error) {
            Logger.error('Admin sanitization error:', error);
            next();
        }
    };
};

/**
 * Authentication-specific sanitization middleware
 * @returns {function} Middleware function
 */
const authSanitization = () => {
    return (req, res, next) => {
        try {
            // Sanitize authentication-related fields
            if (req.body) {
                const authFields = ['email', 'username', 'password', 'confirmPassword'];
                authFields.forEach(field => {
                    if (req.body[field] && typeof req.body[field] === 'string') {
                        if (field === 'email') {
                            req.body[field] = ComprehensiveSanitizer.sanitize(req.body[field], 'email');
                        } else if (field === 'password' || field === 'confirmPassword') {
                            // Don't sanitize passwords to preserve special characters
                            // Just trim whitespace
                            req.body[field] = req.body[field].trim();
                        } else {
                            req.body[field] = ComprehensiveSanitizer.sanitize(req.body[field], 'html');
                        }
                    }
                });
            }

            next();
        } catch (error) {
            Logger.error('Auth sanitization error:', error);
            next();
        }
    };
};

module.exports = {
    comprehensiveInputSanitization,
    routeSpecificSanitization,
    fieldSpecificSanitization,
    fileUploadSanitization,
    apiSanitization,
    adminSanitization,
    authSanitization
}; 