const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');
const { Logger } = require('../utils/logger');

// Redis client for distributed rate limiting (optional)
let redisClient = null;
try {
    redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
    });
} catch (error) {
    Logger.warn('Redis not available, using in-memory rate limiting');
}

// Custom key generator for better rate limiting
const keyGenerator = (req) => {
    // Use user ID if authenticated, otherwise use IP
    const identifier = req.user?.id || req.ip;
    const route = req.route?.path || req.path;
    return `${identifier}:${route}`;
};

// Custom skip function for whitelisted IPs
const skipRateLimit = (req) => {
    const whitelistedIPs = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
    return whitelistedIPs.includes(req.ip);
};

// Enhanced error handler
const errorHandler = (req, res) => {
    const retryAfter = Math.ceil(req.rateLimit.resetTime / 1000);
    res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: retryAfter,
        limit: req.rateLimit.limit,
        remaining: req.rateLimit.remaining,
        resetTime: new Date(req.rateLimit.resetTime).toISOString()
    });
};

// Store configuration
const storeConfig = redisClient ? {
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    })
} : {};

// =============================================================================
// AUTHENTICATION RATE LIMITING
// =============================================================================

// Strict authentication limiter for login attempts
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again in 15 minutes.'
    },
    ...storeConfig
});

// Registration limiter (more strict)
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many registration attempts. Please try again in 1 hour.'
    },
    ...storeConfig
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset attempts. Please try again in 1 hour.'
    },
    ...storeConfig
});

// =============================================================================
// API RATE LIMITING
// =============================================================================

// General API limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many API requests. Please try again in 15 minutes.'
    },
    ...storeConfig
});

// Strict API limiter for sensitive endpoints
const strictApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 requests per 15 minutes
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests to sensitive endpoints. Please try again in 15 minutes.'
    },
    ...storeConfig
});

// =============================================================================
// SENSITIVE OPERATIONS RATE LIMITING
// =============================================================================

// Financial operations limiter
const financialLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 financial operations per hour
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many financial operations. Please try again in 1 hour.'
    },
    ...storeConfig
});

// Account management limiter
const accountLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5, // 5 account operations per day
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many account operations. Please try again tomorrow.'
    },
    ...storeConfig
});

// =============================================================================
// FILE UPLOAD RATE LIMITING
// =============================================================================

// File upload limiter
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many file uploads. Please try again in 1 hour.'
    },
    ...storeConfig
});

// Large file upload limiter
const largeUploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 large uploads per hour
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many large file uploads. Please try again in 1 hour.'
    },
    ...storeConfig
});

// =============================================================================
// SPECIALIZED RATE LIMITING
// =============================================================================

// Email sending limiter
const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 emails per hour
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many email requests. Please try again in 1 hour.'
    },
    ...storeConfig
});

// SMS/OTP limiter
const smsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 SMS/OTP requests per hour
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many SMS/OTP requests. Please try again in 1 hour.'
    },
    ...storeConfig
});

// Admin operations limiter
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 admin operations per 15 minutes
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many admin operations. Please try again in 15 minutes.'
    },
    ...storeConfig
});

// =============================================================================
// BURST PROTECTION
// =============================================================================

// Burst limiter for immediate protection
const burstLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    keyGenerator: keyGenerator,
    skip: skipRateLimit,
    handler: errorHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please slow down.'
    },
    ...storeConfig
});

// =============================================================================
// DYNAMIC RATE LIMITING
// =============================================================================

// Dynamic rate limiter based on user role
const dynamicLimiter = (req, res, next) => {
    const userRole = req.user?.role || 'guest';
    const limits = {
        admin: 200,
        user: 100,
        guest: 50
    };
    
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: limits[userRole] || 50,
        keyGenerator: keyGenerator,
        skip: skipRateLimit,
        handler: errorHandler,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: `Rate limit exceeded for ${userRole} role. Please try again in 15 minutes.`
        },
        ...storeConfig
    });
    
    return limiter(req, res, next);
};

// =============================================================================
// RATE LIMITING UTILITIES
// =============================================================================

// Get rate limit info for debugging
const getRateLimitInfo = (req) => {
    return {
        limit: req.rateLimit?.limit,
        remaining: req.rateLimit?.remaining,
        resetTime: req.rateLimit?.resetTime,
        current: req.rateLimit?.current,
        resetTimeFormatted: req.rateLimit?.resetTime ? 
            new Date(req.rateLimit.resetTime).toISOString() : null
    };
};

// Rate limiting middleware that adds info to response headers
const rateLimitWithInfo = (limiter) => {
    return (req, res, next) => {
        limiter(req, res, (err) => {
            if (err) return next(err);
            
            // Add rate limit info to response headers
            if (req.rateLimit) {
                res.set({
                    'X-RateLimit-Limit': req.rateLimit.limit,
                    'X-RateLimit-Remaining': req.rateLimit.remaining,
                    'X-RateLimit-Reset': new Date(req.rateLimit.resetTime).toISOString()
                });
            }
            
            next();
        });
    };
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    // Authentication limiters
    authLimiter: rateLimitWithInfo(authLimiter),
    registrationLimiter: rateLimitWithInfo(registrationLimiter),
    passwordResetLimiter: rateLimitWithInfo(passwordResetLimiter),
    
    // API limiters
    apiLimiter: rateLimitWithInfo(apiLimiter),
    strictApiLimiter: rateLimitWithInfo(strictApiLimiter),
    
    // Sensitive operations limiters
    financialLimiter: rateLimitWithInfo(financialLimiter),
    accountLimiter: rateLimitWithInfo(accountLimiter),
    sensitiveLimiter: rateLimitWithInfo(financialLimiter), // Alias for backward compatibility
    
    // File upload limiters
    uploadLimiter: rateLimitWithInfo(uploadLimiter),
    largeUploadLimiter: rateLimitWithInfo(largeUploadLimiter),
    
    // Specialized limiters
    emailLimiter: rateLimitWithInfo(emailLimiter),
    smsLimiter: rateLimitWithInfo(smsLimiter),
    adminLimiter: rateLimitWithInfo(adminLimiter),
    
    // Protection limiters
    burstLimiter: rateLimitWithInfo(burstLimiter),
    dynamicLimiter: rateLimitWithInfo(dynamicLimiter),
    
    // Utilities
    getRateLimitInfo,
    keyGenerator,
    skipRateLimit,
    errorHandler
}; 