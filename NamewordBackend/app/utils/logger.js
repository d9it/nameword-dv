const winston = require('winston');
const { format } = winston;
const env = require('../../start/env');

// Custom format for structured logging
const logFormat = format.combine(
	format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	format.errors({ stack: true }),
	format.json(),
	format.printf(({ timestamp, level, message, ...meta }) => {
		const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
		return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
	})
);

// Create logger instance
const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || 'info',
	format: logFormat,
	transports: [
		// Console transport for development
		new winston.transports.Console({
			format: format.combine(
				format.colorize(),
				format.simple(),
				format.printf(({ timestamp, level, message, ...meta }) => {
					const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
					return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
				})
			)
		}),
		// File transport for production
		...(process.env.NODE_ENV === 'production' ? [
			new winston.transports.File({
				filename: 'logs/error.log',
				level: 'error',
				maxsize: 5242880, // 5MB
				maxFiles: 5
			}),
			new winston.transports.File({
				filename: 'logs/combined.log',
				maxsize: 5242880, // 5MB
				maxFiles: 5
			})
		] : [])
	],
	// Handle uncaught exceptions
	exceptionHandlers: [
		new winston.transports.File({ filename: 'logs/exceptions.log' })
	],
	// Handle unhandled rejections
	rejectionHandlers: [
		new winston.transports.File({ filename: 'logs/rejections.log' })
	]
});

// Security: Sanitize sensitive data from logs
const sanitizeData = (data) => {
	if (!data || typeof data !== 'object') return data;
	
	const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'key', 'authorization'];
	const sanitized = { ...data };
	
	sensitiveFields.forEach(field => {
		if (sanitized[field]) {
			sanitized[field] = '[REDACTED]';
		}
	});
	
	return sanitized;
};

// Enhanced logging methods with context
class Logger {
	/**
	 * Log info message
	 * @param {string} message - Log message
	 * @param {Object} context - Additional context
	 */
	static info(message, context = {}) {
		logger.info(message, sanitizeData(context));
	}

	/**
	 * Log error message
	 * @param {string|Error} error - Error message or Error object
	 * @param {Object} context - Additional context
	 */
	static error(error, context = {}) {
		const errorMessage = error instanceof Error ? error.message : error;
		const errorStack = error instanceof Error ? error.stack : undefined;
		
		logger.error(errorMessage, {
			...sanitizeData(context),
			...(errorStack && { stack: errorStack })
		});
	}

	/**
	 * Log warning message
	 * @param {string} message - Log message
	 * @param {Object} context - Additional context
	 */
	static warn(message, context = {}) {
		logger.warn(message, sanitizeData(context));
	}

	/**
	 * Log debug message (only in development)
	 * @param {string} message - Log message
	 * @param {Object} context - Additional context
	 */
	static debug(message, context = {}) {
		if (process.env.NODE_ENV === 'development') {
			logger.debug(message, sanitizeData(context));
		}
	}

	/**
	 * Log API request
	 * @param {string} method - HTTP method
	 * @param {string} url - Request URL
	 * @param {Object} context - Additional context
	 */
	static apiRequest(method, url, context = {}) {
		this.info(`API Request: ${method} ${url}`, {
			type: 'api_request',
			method,
			url,
			...context
		});
	}

	/**
	 * Log API response
	 * @param {string} method - HTTP method
	 * @param {string} url - Request URL
	 * @param {number} statusCode - Response status code
	 * @param {Object} context - Additional context
	 */
	static apiResponse(method, url, statusCode, context = {}) {
		const level = statusCode >= 400 ? 'warn' : 'info';
		this[level](`API Response: ${method} ${url} - ${statusCode}`, {
			type: 'api_response',
			method,
			url,
			statusCode,
			...context
		});
	}

	/**
	 * Log authentication event
	 * @param {string} event - Authentication event type
	 * @param {Object} context - Additional context
	 */
	static auth(event, context = {}) {
		this.info(`Authentication: ${event}`, {
			type: 'authentication',
			event,
			...sanitizeData(context)
		});
	}

	/**
	 * Log security event
	 * @param {string} event - Security event type
	 * @param {Object} context - Additional context
	 */
	static security(event, context = {}) {
		this.warn(`Security Event: ${event}`, {
			type: 'security',
			event,
			...sanitizeData(context)
		});
	}

	/**
	 * Log database operation
	 * @param {string} operation - Database operation
	 * @param {string} collection - Collection name
	 * @param {Object} context - Additional context
	 */
	static database(operation, collection, context = {}) {
		this.debug(`Database: ${operation} on ${collection}`, {
			type: 'database',
			operation,
			collection,
			...context
		});
	}

	/**
	 * Log business logic event
	 * @param {string} event - Business event type
	 * @param {Object} context - Additional context
	 */
	static business(event, context = {}) {
		this.info(`Business Event: ${event}`, {
			type: 'business',
			event,
			...context
		});
	}

	/**
	 * Log performance metric
	 * @param {string} metric - Metric name
	 * @param {number} value - Metric value
	 * @param {string} unit - Unit of measurement
	 * @param {Object} context - Additional context
	 */
	static performance(metric, value, unit = 'ms', context = {}) {
		this.info(`Performance: ${metric} = ${value}${unit}`, {
			type: 'performance',
			metric,
			value,
			unit,
			...context
		});
	}

	/**
	 * Log user activity
	 * @param {string} action - User action
	 * @param {string} userId - User ID
	 * @param {Object} context - Additional context
	 */
	static userActivity(action, userId, context = {}) {
		this.info(`User Activity: ${action}`, {
			type: 'user_activity',
			action,
			userId,
			...context
		});
	}

	/**
	 * Log system event
	 * @param {string} event - System event type
	 * @param {Object} context - Additional context
	 */
	static system(event, context = {}) {
		this.info(`System Event: ${event}`, {
			type: 'system',
			event,
			...context
		});
	}

	/**
	 * Log third-party service interaction
	 * @param {string} service - Service name
	 * @param {string} operation - Operation type
	 * @param {Object} context - Additional context
	 */
	static thirdParty(service, operation, context = {}) {
		this.info(`Third-party: ${service} - ${operation}`, {
			type: 'third_party',
			service,
			operation,
			...sanitizeData(context)
		});
	}

	/**
	 * Log error with enhanced context
	 * @param {Error} error - Error object
	 * @param {Object} context - Additional context
	 */
	static logError(error, context = {}) {
		const errorContext = {
			errorType: error.name || 'Error',
			errorCode: error.code,
			errorStack: error.stack,
			...context
		};

		this.error(error.message, errorContext);
	}

	/**
	 * Log request context
	 * @param {Object} req - Express request object
	 * @param {Object} context - Additional context
	 */
	static request(req, context = {}) {
		const requestContext = {
			method: req.method,
			url: req.url,
			ip: req.ip,
			userAgent: req.get('User-Agent'),
			userId: req.user?.id,
			...context
		};

		this.debug('Request', requestContext);
	}

	/**
	 * Log response context
	 * @param {Object} res - Express response object
	 * @param {Object} context - Additional context
	 */
	static response(res, context = {}) {
		const responseContext = {
			statusCode: res.statusCode,
			...context
		};

		this.debug('Response', responseContext);
	}
}

// Export both the logger instance and the Logger class
module.exports = {
	logger,
	Logger
}; 