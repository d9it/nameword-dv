const winston = require("winston");
const CustomError = require("../errors/CustomError");
const ErrorHandler = require("../utils/errorHandler");
const SecureConfig = require("../utils/secureConfig");

const errorHandler = function (err, req, res, next) {
	// Use comprehensive error handling
	const errorResponse = ErrorHandler.handleSpecificError(err, {
		url: req.url,
		method: req.method,
		userId: req.user?.id,
		ip: req.ip,
		userAgent: req.get('User-Agent')
	});

	// Log error with proper context
	ErrorHandler.logError(err, {
		url: req.url,
		method: req.method,
		userId: req.user?.id,
		ip: req.ip,
		userAgent: req.get('User-Agent'),
		errorType: errorResponse.type
	});

	// Handle custom errors with their specific serialization
	if (err instanceof CustomError) {
		return res
			.status(err.statusCode)
			.json({ 
				success: false,
				errors: err.serializeErrors(),
				timestamp: new Date().toISOString()
			});
	}

	// Get secure error handling configuration
	const errorConfig = SecureConfig.getErrorHandlingConfig();

	// Create standardized error response with secure settings
	const response = ErrorHandler.createErrorResponse(err, {
		includeStack: errorConfig.includeStack, // Never include stack in production
		customMessage: errorResponse.message,
		sanitizeErrors: errorConfig.sanitizeErrors
	});

	// Send response
	res.status(errorResponse.statusCode).json(response);
};

module.exports = errorHandler;
