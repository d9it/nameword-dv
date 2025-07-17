const { Logger } = require('../utils/logger');

/**
 * Logging middleware for consistent request/response logging
 */
const loggingMiddleware = (req, res, next) => {
	// Skip logging for health checks and static files
	if (req.path === '/health' || req.path.startsWith('/static/')) {
		return next();
	}

	const startTime = Date.now();

	// Log request
	Logger.request(req, {
		requestId: req.id || Math.random().toString(36).substring(7),
		timestamp: new Date().toISOString()
	});

	// Override res.end to log response
	const originalEnd = res.end;
	res.end = function(chunk, encoding) {
		const duration = Date.now() - startTime;
		const responseContext = {
			duration,
			contentLength: res.get('Content-Length'),
			contentType: res.get('Content-Type')
		};

		// Log response
		Logger.response(res, responseContext);

		// Log performance if request takes too long
		if (duration > 1000) {
			Logger.performance('slow_request', duration, 'ms', {
				url: req.url,
				method: req.method,
				statusCode: res.statusCode
			});
		}

		// Call original end method
		originalEnd.call(this, chunk, encoding);
	};

	next();
};

/**
 * Error logging middleware
 */
const errorLoggingMiddleware = (err, req, res, next) => {
	// Log error with request context
	Logger.logError(err, {
		url: req.url,
		method: req.method,
		ip: req.ip,
		userAgent: req.get('User-Agent'),
		userId: req.user?.id,
		requestId: req.id || Math.random().toString(36).substring(7)
	});

	next(err);
};

/**
 * Security event logging middleware
 */
const securityLoggingMiddleware = (req, res, next) => {
	// Log potential security events
	const securityEvents = [];

	// Check for suspicious user agents
	const userAgent = req.get('User-Agent');
	if (userAgent && (
		userAgent.includes('bot') ||
		userAgent.includes('crawler') ||
		userAgent.includes('spider') ||
		userAgent.includes('scraper')
	)) {
		securityEvents.push('suspicious_user_agent');
	}

	// Check for rapid requests (basic rate limiting detection)
	if (req.headers['x-forwarded-for'] || req.headers['x-real-ip']) {
		securityEvents.push('proxied_request');
	}

	// Log security events if any detected
	if (securityEvents.length > 0) {
		Logger.security('multiple_security_events', {
			events: securityEvents,
			url: req.url,
			method: req.method,
			ip: req.ip,
			userAgent
		});
	}

	next();
};

/**
 * Database operation logging middleware
 */
const databaseLoggingMiddleware = (req, res, next) => {
	// Override mongoose operations to log database activity
	const mongoose = require('mongoose');
	
	// Store original methods
	const originalFind = mongoose.Model.find;
	const originalFindOne = mongoose.Model.findOne;
	const originalSave = mongoose.Model.prototype.save;
	const originalUpdate = mongoose.Model.updateOne;
	const originalDelete = mongoose.Model.deleteOne;

	// Override find method
	mongoose.Model.find = function(...args) {
		Logger.database('find', this.collection.name, {
			query: args[0],
			options: args[1]
		});
		return originalFind.apply(this, args);
	};

	// Override findOne method
	mongoose.Model.findOne = function(...args) {
		Logger.database('findOne', this.collection.name, {
			query: args[0],
			options: args[1]
		});
		return originalFindOne.apply(this, args);
	};

	// Override save method
	mongoose.Model.prototype.save = function(...args) {
		Logger.database('save', this.constructor.collection.name, {
			documentId: this._id,
			operation: this.isNew ? 'insert' : 'update'
		});
		return originalSave.apply(this, args);
	};

	// Override updateOne method
	mongoose.Model.updateOne = function(...args) {
		Logger.database('updateOne', this.collection.name, {
			filter: args[0],
			update: args[1],
			options: args[2]
		});
		return originalUpdate.apply(this, args);
	};

	// Override deleteOne method
	mongoose.Model.deleteOne = function(...args) {
		Logger.database('deleteOne', this.collection.name, {
			filter: args[0],
			options: args[1]
		});
		return originalDelete.apply(this, args);
	};

	next();
};

module.exports = {
	loggingMiddleware,
	errorLoggingMiddleware,
	securityLoggingMiddleware,
	databaseLoggingMiddleware
}; 