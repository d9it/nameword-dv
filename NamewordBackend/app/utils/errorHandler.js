const winston = require('winston');
const { captureException } = require('./sentry');

/**
 * Comprehensive Error Handling Utility
 * Provides consistent error handling across the application
 */
class ErrorHandler {
    
    /**
     * Log error with proper context
     * @param {Error} error - The error to log
     * @param {Object} context - Additional context
     * @param {string} level - Log level (error, warn, info)
     */
    static logError(error, context = {}, level = 'error') {
        const logData = {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
            ...context
        };

        // Use winston for structured logging
        winston[level](logData);

        // Capture in Sentry for production errors
        if (level === 'error' && process.env.NODE_ENV === 'production') {
            captureException(error, context);
        }
    }

    /**
     * Handle async operations with proper error handling
     * @param {Function} fn - Async function to execute
     * @param {Object} context - Context for error logging
     * @returns {Function} Wrapped function
     */
    static asyncHandler(fn, context = {}) {
        return async (req, res, next) => {
            try {
                await fn(req, res, next);
            } catch (error) {
                this.logError(error, {
                    ...context,
                    url: req.url,
                    method: req.method,
                    userId: req.user?.id,
                    ip: req.ip
                });
                next(error);
            }
        };
    }

    /**
     * Handle database operations with proper error handling
     * @param {Function} operation - Database operation
     * @param {Object} context - Context for error logging
     * @returns {Promise} Result of operation
     */
    static async handleDatabaseOperation(operation, context = {}) {
        try {
            return await operation();
        } catch (error) {
            this.logError(error, {
                ...context,
                type: 'database_operation'
            });
            throw error;
        }
    }

    /**
     * Handle API calls with proper error handling
     * @param {Function} apiCall - API call function
     * @param {Object} context - Context for error logging
     * @returns {Promise} Result of API call
     */
    static async handleApiCall(apiCall, context = {}) {
        try {
            return await apiCall();
        } catch (error) {
            this.logError(error, {
                ...context,
                type: 'api_call',
                statusCode: error.response?.status,
                responseData: error.response?.data
            });
            throw error;
        }
    }

    /**
     * Handle file operations with proper error handling
     * @param {Function} fileOperation - File operation
     * @param {Object} context - Context for error logging
     * @returns {Promise} Result of file operation
     */
    static async handleFileOperation(fileOperation, context = {}) {
        try {
            return await fileOperation();
        } catch (error) {
            this.logError(error, {
                ...context,
                type: 'file_operation'
            });
            throw error;
        }
    }

    /**
     * Create a standardized error response
     * @param {Error} error - The error
     * @param {Object} options - Response options
     * @returns {Object} Standardized error response
     */
    static createErrorResponse(error, options = {}) {
        const {
            includeStack = process.env.NODE_ENV === 'development',
            includeDetails = process.env.NODE_ENV === 'development',
            customMessage = null
        } = options;

        const response = {
            success: false,
            message: customMessage || error.message || 'An error occurred',
            timestamp: new Date().toISOString()
        };

        if (includeDetails) {
            response.details = {
                name: error.name,
                code: error.code,
                ...(includeStack && { stack: error.stack })
            };
        }

        return response;
    }

    /**
     * Handle cleanup operations on error
     * @param {Array} cleanupOperations - Array of cleanup functions
     * @param {Error} originalError - The original error
     */
    static async handleCleanup(cleanupOperations, originalError) {
        const cleanupErrors = [];

        for (const cleanupOp of cleanupOperations) {
            try {
                await cleanupOp();
            } catch (cleanupError) {
                cleanupErrors.push(cleanupError);
                this.logError(cleanupError, {
                    type: 'cleanup_error',
                    originalError: originalError.message
                });
            }
        }

        if (cleanupErrors.length > 0) {
            this.logError(new Error('Cleanup operations failed'), {
                cleanupErrors: cleanupErrors.map(e => e.message),
                originalError: originalError.message
            });
        }
    }

    /**
     * Retry operation with exponential backoff
     * @param {Function} operation - Operation to retry
     * @param {Object} options - Retry options
     * @returns {Promise} Result of operation
     */
    static async retryOperation(operation, options = {}) {
        const {
            maxAttempts = 3,
            baseDelay = 1000,
            maxDelay = 10000,
            shouldRetry = (error) => true
        } = options;

        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                if (attempt === maxAttempts || !shouldRetry(error)) {
                    throw error;
                }

                const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
                
                this.logError(error, {
                    type: 'retry_attempt',
                    attempt,
                    maxAttempts,
                    delay
                });

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * Validate error and add context
     * @param {Error} error - The error to validate
     * @param {Object} context - Additional context
     * @returns {Error} Enhanced error
     */
    static enhanceError(error, context = {}) {
        // Add context to error
        Object.assign(error, context);
        
        // Ensure error has proper properties
        if (!error.message) {
            error.message = 'An unknown error occurred';
        }
        
        if (!error.name) {
            error.name = 'Error';
        }

        return error;
    }

    /**
     * Handle specific error types
     * @param {Error} error - The error
     * @param {Object} context - Context for handling
     * @returns {Object} Handled error response
     */
    static handleSpecificError(error, context = {}) {
        // Handle network errors
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return {
                statusCode: 503,
                message: 'Service temporarily unavailable',
                type: 'network_error'
            };
        }

        // Handle timeout errors
        if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
            return {
                statusCode: 408,
                message: 'Request timeout',
                type: 'timeout_error'
            };
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return {
                statusCode: 400,
                message: 'Validation failed',
                type: 'validation_error',
                details: error.errors
            };
        }

        // Handle authentication errors
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return {
                statusCode: 401,
                message: 'Authentication failed',
                type: 'auth_error'
            };
        }

        // Handle database errors
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            return {
                statusCode: 500,
                message: 'Database operation failed',
                type: 'database_error'
            };
        }

        // Default error handling
        return {
            statusCode: 500,
            message: 'Internal server error',
            type: 'internal_error'
        };
    }

    /**
     * Create error middleware for Express
     * @returns {Function} Express error middleware
     */
    static createErrorMiddleware() {
        return (error, req, res, next) => {
            // Log the error with context
            this.logError(error, {
                url: req.url,
                method: req.method,
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // Handle specific error types
            const errorResponse = this.handleSpecificError(error, {
                url: req.url,
                method: req.method
            });

            // Create standardized response
            const response = this.createErrorResponse(error, {
                includeStack: process.env.NODE_ENV === 'development',
                customMessage: errorResponse.message
            });

            // Send response
            res.status(errorResponse.statusCode).json(response);
        };
    }
}

module.exports = ErrorHandler; 