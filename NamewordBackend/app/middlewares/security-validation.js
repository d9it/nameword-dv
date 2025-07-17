const { body, param, query, validationResult } = require('express-validator');
const RequestValidationError = require('../errors/RequestValidationError');

// Sanitize and validate user input
const sanitizeInput = (req, res, next) => {
	// Sanitize body parameters
	if (req.body) {
		Object.keys(req.body).forEach(key => {
			if (typeof req.body[key] === 'string') {
				req.body[key] = req.body[key].trim();
			}
		});
	}
	
	// Sanitize query parameters
	if (req.query) {
		Object.keys(req.query).forEach(key => {
			if (typeof req.query[key] === 'string') {
				req.query[key] = req.query[key].trim();
			}
		});
	}
	
	next();
};

// Validate MongoDB ObjectId
const validateObjectId = (paramName) => {
	return param(paramName)
		.isMongoId()
		.withMessage(`${paramName} must be a valid MongoDB ObjectId`);
};

// Validate email format
const validateEmail = (fieldName) => {
	return body(fieldName)
		.isEmail()
		.normalizeEmail()
		.withMessage(`${fieldName} must be a valid email address`);
};

// Validate password strength
const validatePassword = () => {
	return body('password')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters long')
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
		.withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
};

// Validate API key format
const validateApiKey = () => {
	return body('apiKey')
		.isLength({ min: 32, max: 64 })
		.withMessage('API key must be between 32 and 64 characters')
		.matches(/^[a-zA-Z0-9_-]+$/)
		.withMessage('API key can only contain letters, numbers, hyphens, and underscores');
};

// Validate IP address
const validateIpAddress = (fieldName) => {
	return body(fieldName)
		.isIP()
		.withMessage(`${fieldName} must be a valid IP address`);
};

// Validate URL format
const validateUrl = (fieldName) => {
	return body(fieldName)
		.isURL()
		.withMessage(`${fieldName} must be a valid URL`);
};

// Rate limiting validation
const rateLimitValidation = (req, res, next) => {
	// Basic rate limiting - can be enhanced with Redis
	const clientIp = req.ip;
	const now = Date.now();
	
	if (!req.app.locals.rateLimit) {
		req.app.locals.rateLimit = {};
	}
	
	if (!req.app.locals.rateLimit[clientIp]) {
		req.app.locals.rateLimit[clientIp] = { count: 0, resetTime: now + 60000 }; // 1 minute window
	}
	
	const rateLimit = req.app.locals.rateLimit[clientIp];
	
	if (now > rateLimit.resetTime) {
		rateLimit.count = 0;
		rateLimit.resetTime = now + 60000;
	}
	
	rateLimit.count++;
	
	if (rateLimit.count > 100) { // 100 requests per minute
		return res.status(429).json({
			success: false,
			message: 'Too many requests. Please try again later.'
		});
	}
	
	next();
};

// Check validation results
const checkValidationResult = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new RequestValidationError(errors.array({ onlyFirstError: true }));
	}
	next();
};

module.exports = {
	sanitizeInput,
	validateObjectId,
	validateEmail,
	validatePassword,
	validateApiKey,
	validateIpAddress,
	validateUrl,
	rateLimitValidation,
	checkValidationResult
}; 