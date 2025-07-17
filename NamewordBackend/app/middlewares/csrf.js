const { doubleCsrf } = require('csrf-csrf');
const { BadRequestError } = require('../errors/BadRequestError');

// CSRF protection configuration
const csrfProtection = doubleCsrf({
	secret: process.env.APP_KEY,
	cookieName: 'X-CSRF-Token',
	cookieOptions: {
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
		signed: true
	},
	size: 64,
	ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
	getTokenFromRequest: (req) => {
		// Check for CSRF token in headers first
		const headerToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
		if (headerToken) {
			return headerToken;
		}
		
		// Check for CSRF token in body
		if (req.body && req.body._csrf) {
			return req.body._csrf;
		}
		
		// Check for CSRF token in query parameters
		if (req.query && req.query._csrf) {
			return req.query._csrf;
		}
		
		return null;
	}
});

// Middleware to generate CSRF token
const generateCsrfToken = (req, res, next) => {
	try {
		// Generate CSRF token
		const token = csrfProtection.generateToken(req, res);
		
		// Add token to response headers for frontend consumption
		res.setHeader('X-CSRF-Token', token);
		
		// Add token to response body for API responses
		if (req.xhr || req.headers.accept?.includes('application/json')) {
			res.locals.csrfToken = token;
		}
		
		next();
			} catch (error) {
			const ErrorHandler = require('../utils/errorHandler');
			ErrorHandler.logError(error, {
				type: 'csrf_token_generation_error',
				url: req.url,
				method: req.method
			});
			next(error);
		}
};

// Middleware to validate CSRF token
const validateCsrfToken = (req, res, next) => {
	try {
		// Skip CSRF validation for certain routes
		const skipCsrfRoutes = [
			'/api/auth/login',
			'/api/auth/register',
			'/api/auth/forgot-password',
			'/api/auth/reset-password',
			'/api/auth/verify',
			'/api/auth/google',
			'/api/auth/telegram',
			'/api/webhooks',
			'/api/telegram/webhook'
		];
		
		// Skip CSRF validation for GET requests and specified routes
		if (req.method === 'GET' || skipCsrfRoutes.includes(req.path)) {
			return next();
		}
		
		// Validate CSRF token
		csrfProtection.validateRequest(req, res);
		next();
			} catch (error) {
			const ErrorHandler = require('../utils/errorHandler');
			ErrorHandler.logError(error, {
				type: 'csrf_validation_error',
				url: req.url,
				method: req.method,
				token: req.body._csrf || req.headers['x-csrf-token']
			});
			throw new BadRequestError('Invalid CSRF token. Please refresh the page and try again.');
		}
};

// Middleware to handle CSRF errors
const handleCsrfError = (error, req, res, next) => {
	if (error.name === 'CSRFError') {
		return res.status(403).json({
			success: false,
			message: 'CSRF token validation failed. Please refresh the page and try again.',
			error: 'CSRF_ERROR'
		});
	}
	next(error);
};

// Middleware to add CSRF token to all responses
const addCsrfToResponse = (req, res, next) => {
	// Add CSRF token to response if it exists in locals
	if (res.locals.csrfToken) {
		if (req.xhr || req.headers.accept?.includes('application/json')) {
			res.json({
				...res.locals.responseData,
				csrfToken: res.locals.csrfToken
			});
		} else {
			// For non-API responses, add token to response locals
			res.locals.csrfToken = res.locals.csrfToken;
		}
	}
	next();
};

module.exports = {
	csrfProtection,
	generateCsrfToken,
	validateCsrfToken,
	handleCsrfError,
	addCsrfToResponse
}; 