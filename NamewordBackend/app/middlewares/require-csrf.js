const { validateCsrfToken } = require('./csrf');

/**
 * Middleware to require CSRF protection for specific routes
 * This should be applied to routes that modify data (POST, PUT, DELETE, PATCH)
 */
const requireCsrf = (req, res, next) => {
	// Apply CSRF validation
	validateCsrfToken(req, res, next);
};

module.exports = requireCsrf; 