const { body, query, param } = require('express-validator');
const { sanitizeHtml, sanitizeUrl } = require('./sanitizer');

/**
 * Enhanced input validation with security measures
 */
class InputValidator {
    
    /**
     * Sanitize and validate string input
     * @param {string} field - Field name
     * @param {string} location - 'body', 'query', or 'param'
     * @param {object} options - Validation options
     * @returns {array} Validation rules
     */
    static string(field, location = 'body', options = {}) {
        const { required = true, minLength = 1, maxLength = 255, allowHtml = false, isUrl = false } = options;
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

        if (!allowHtml) {
            rules.push(
                validator(field).custom((value) => {
                    if (value && /<[^>]*>/.test(value)) {
                        throw new Error(`${field} contains invalid HTML`);
                    }
                    return true;
                })
            );
        }

        if (isUrl) {
            rules.push(
                validator(field).custom((value) => {
                    if (value && !/^https?:\/\/.+/.test(value)) {
                        throw new Error(`${field} must be a valid URL`);
                    }
                    return true;
                })
            );
        }

        return rules;
    }

    /**
     * Validate email with enhanced security
     * @param {string} field - Field name
     * @param {string} location - 'body', 'query', or 'param'
     * @returns {array} Validation rules
     */
    static email(field, location = 'body') {
        const validator = location === 'body' ? body : location === 'query' ? query : param;
        
        return [
            validator(field).trim().notEmpty().withMessage(`${field} is required`),
            validator(field).isEmail().withMessage(`${field} must be a valid email address`),
            validator(field).isLength({ max: 254 }).withMessage(`${field} is too long`),
            validator(field).custom((value) => {
                // Prevent email injection attacks
                if (value && /[<>\"'&]/.test(value)) {
                    throw new Error(`${field} contains invalid characters`);
                }
                return true;
            })
        ];
    }

    /**
     * Validate password with security requirements
     * @param {string} field - Field name
     * @param {string} location - 'body', 'query', or 'param'
     * @returns {array} Validation rules
     */
    static password(field, location = 'body') {
        const validator = location === 'body' ? body : location === 'query' ? query : param;
        
        return [
            validator(field).trim().notEmpty().withMessage(`${field} is required`),
            validator(field).isLength({ min: 8, max: 128 }).withMessage(`${field} must be between 8 and 128 characters`),
            validator(field).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
                .withMessage(`${field} must contain at least one uppercase letter, one lowercase letter, one number, and one special character`),
            validator(field).custom((value) => {
                // Prevent common weak passwords
                const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
                if (value && weakPasswords.includes(value.toLowerCase())) {
                    throw new Error(`${field} is too common, please choose a stronger password`);
                }
                return true;
            })
        ];
    }

    /**
     * Validate numeric input
     * @param {string} field - Field name
     * @param {string} location - 'body', 'query', or 'param'
     * @param {object} options - Validation options
     * @returns {array} Validation rules
     */
    static number(field, location = 'body', options = {}) {
        const { required = true, min = null, max = null, isInt = false } = options;
        const validator = location === 'body' ? body : location === 'query' ? query : param;
        
        let rules = [
            validator(field).trim()
        ];

        if (required) {
            rules.push(validator(field).notEmpty().withMessage(`${field} is required`));
        }

        if (isInt) {
            rules.push(validator(field).isInt().withMessage(`${field} must be an integer`));
        } else {
            rules.push(validator(field).isNumeric().withMessage(`${field} must be a number`));
        }

        if (min !== null) {
            rules.push(validator(field).isInt({ min }).withMessage(`${field} must be at least ${min}`));
        }

        if (max !== null) {
            rules.push(validator(field).isInt({ max }).withMessage(`${field} must be at most ${max}`));
        }

        return rules;
    }

    /**
     * Validate MongoDB ObjectId
     * @param {string} field - Field name
     * @param {string} location - 'body', 'query', or 'param'
     * @returns {array} Validation rules
     */
    static mongoId(field, location = 'body') {
        const validator = location === 'body' ? body : location === 'query' ? query : param;
        
        return [
            validator(field).trim().notEmpty().withMessage(`${field} is required`),
            validator(field).isMongoId().withMessage(`${field} must be a valid MongoDB ObjectId`)
        ];
    }

    /**
     * Validate boolean input
     * @param {string} field - Field name
     * @param {string} location - 'body', 'query', or 'param'
     * @returns {array} Validation rules
     */
    static boolean(field, location = 'body') {
        const validator = location === 'body' ? body : location === 'query' ? query : param;
        
        return [
            validator(field).trim().notEmpty().withMessage(`${field} is required`),
            validator(field).isBoolean().withMessage(`${field} must be true or false`)
        ];
    }

    /**
     * Validate URL with security checks
     * @param {string} field - Field name
     * @param {string} location - 'body', 'query', or 'param'
     * @returns {array} Validation rules
     */
    static url(field, location = 'body') {
        const validator = location === 'body' ? body : location === 'query' ? query : param;
        
        return [
            validator(field).trim().notEmpty().withMessage(`${field} is required`),
            validator(field).isURL().withMessage(`${field} must be a valid URL`),
            validator(field).custom((value) => {
                if (value) {
                    try {
                        const url = new URL(value);
                        // Only allow http and https protocols
                        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                            throw new Error(`${field} must use HTTP or HTTPS protocol`);
                        }
                        // Prevent potential SSRF attacks
                        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                            throw new Error(`${field} cannot point to localhost`);
                        }
                    } catch (error) {
                        throw new Error(`${field} is not a valid URL`);
                    }
                }
                return true;
            })
        ];
    }

    /**
     * Validate phone number
     * @param {string} field - Field name
     * @param {string} location - 'body', 'query', or 'param'
     * @returns {array} Validation rules
     */
    static phone(field, location = 'body') {
        const validator = location === 'body' ? body : location === 'query' ? query : param;
        
        return [
            validator(field).trim().notEmpty().withMessage(`${field} is required`),
            validator(field).isMobilePhone('any', { strictMode: true }).withMessage(`${field} must be a valid phone number`)
        ];
    }

    /**
     * Validate enum values
     * @param {string} field - Field name
     * @param {array} allowedValues - Array of allowed values
     * @param {string} location - 'body', 'query', or 'param'
     * @returns {array} Validation rules
     */
    static enum(field, allowedValues, location = 'body') {
        const validator = location === 'body' ? body : location === 'query' ? query : param;
        
        return [
            validator(field).trim().notEmpty().withMessage(`${field} is required`),
            validator(field).isIn(allowedValues).withMessage(`${field} must be one of: ${allowedValues.join(', ')}`)
        ];
    }

    /**
     * Sanitize input after validation
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     * @param {function} next - Express next function
     */
    static sanitizeInput(req, res, next) {
        // Sanitize body parameters
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = sanitizeHtml(req.body[key]);
                }
            });
        }

        // Sanitize query parameters
        if (req.query) {
            Object.keys(req.query).forEach(key => {
                if (typeof req.query[key] === 'string') {
                    req.query[key] = sanitizeHtml(req.query[key]);
                }
            });
        }

        next();
    }

    /**
     * Validate file upload
     * @param {string} field - Field name
     * @param {object} options - Validation options
     * @returns {array} Validation rules
     */
    static file(field, options = {}) {
        const { required = true, maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options; // 5MB default
        
        return [
            body(field).custom((value, { req }) => {
                if (required && (!req.files || !req.files[field])) {
                    throw new Error(`${field} is required`);
                }

                if (req.files && req.files[field]) {
                    const file = req.files[field];
                    
                    // Check file size
                    if (file.size > maxSize) {
                        throw new Error(`${field} file size must be less than ${maxSize / (1024 * 1024)}MB`);
                    }

                    // Check file type if specified
                    if (allowedTypes.length > 0) {
                        const fileExtension = file.name.split('.').pop().toLowerCase();
                        if (!allowedTypes.includes(fileExtension)) {
                            throw new Error(`${field} must be one of: ${allowedTypes.join(', ')}`);
                        }
                    }

                    // Check for malicious file extensions
                    const dangerousExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js'];
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    if (dangerousExtensions.includes(fileExtension)) {
                        throw new Error(`${field} file type is not allowed`);
                    }
                }

                return true;
            })
        ];
    }
}

module.exports = InputValidator; 