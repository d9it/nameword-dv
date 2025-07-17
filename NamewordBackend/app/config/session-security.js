/**
 * Session Security Configuration
 * Centralized configuration for all session security settings
 */

const env = require('../../start/env');

/**
 * Session Security Configuration Object
 */
const sessionSecurityConfig = {
    // Session cookie configuration
    cookie: {
        name: "bozzname-server",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: 'strict',
        signed: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        domain: process.env.COOKIE_DOMAIN || undefined,
        path: '/',
        overwrite: true
    },

    // Session security settings
    security: {
        // Session timeout (30 minutes of inactivity)
        timeout: 30 * 60 * 1000,
        
        // Maximum session age (24 hours)
        maxAge: 24 * 60 * 60 * 1000,
        
        // Session rotation on login
        rotateOnLogin: true,
        
        // Validate IP address changes
        validateIP: process.env.SESSION_VALIDATE_IP === 'true',
        
        // Validate user agent changes
        validateUserAgent: true,
        
        // Session fingerprinting
        enableFingerprinting: true,
        
        // CSRF protection
        enableCSRF: true,
        
        // Rate limiting for session operations
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        }
    },

    // JWT configuration
    jwt: {
        algorithm: 'HS256',
        issuer: 'nameword-backend',
        audience: {
            user: 'user',
            admin: 'admin'
        },
        expiresIn: '24h',
        refreshExpiresIn: '7d'
    },

    // Session storage configuration
    storage: {
        // Use Redis for session storage in production
        type: process.env.NODE_ENV === 'production' ? 'redis' : 'memory',
        
        // Redis configuration (if using Redis)
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD,
            db: process.env.REDIS_DB || 0,
            keyPrefix: 'session:'
        }
    },

    // Logging configuration
    logging: {
        enabled: true,
        level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
        events: [
            'session_created',
            'session_destroyed',
            'session_rotated',
            'session_timeout',
            'session_hijacking_detected',
            'invalid_session'
        ]
    },

    // Security headers for session management
    headers: {
        'X-Session-Timeout': '1800', // 30 minutes in seconds
        'X-Session-Valid': 'true',
        'X-Content-Type-Options': 'nosniff'
        // Removed deprecated headers:
        // - X-Frame-Options: replaced by CSP frame-ancestors
        // - X-XSS-Protection: replaced by CSP
    },

    // Environment-specific settings
    environment: {
        development: {
            secure: false,
            sameSite: 'lax',
            logging: 'debug'
        },
        production: {
            secure: true,
            sameSite: 'strict',
            logging: 'warn',
            validateIP: true
        },
        test: {
            secure: false,
            sameSite: 'lax',
            logging: 'error'
        }
    }
};

/**
 * Get session configuration for current environment
 */
function getSessionConfig() {
    const envConfig = sessionSecurityConfig.environment[process.env.NODE_ENV] || sessionSecurityConfig.environment.development;
    
    return {
        ...sessionSecurityConfig.cookie,
        ...envConfig,
        secret: env.APP_KEY,
        resave: false,
        saveUninitialized: false,
        rolling: true
    };
}

/**
 * Validate session security configuration
 */
function validateSessionConfig() {
    const errors = [];
    const warnings = [];

    // Check required environment variables
    if (!env.APP_KEY) {
        errors.push('APP_KEY is required for session security');
    }

    if (!env.JWT_KEY) {
        errors.push('JWT_KEY is required for session security');
    }

    // Check key strength
    if (env.APP_KEY && env.APP_KEY.length < 32) {
        warnings.push('APP_KEY should be at least 32 characters for production');
    }

    if (env.JWT_KEY && env.JWT_KEY.length < 32) {
        warnings.push('JWT_KEY should be at least 32 characters for production');
    }

    // Check for key reuse
    if (env.APP_KEY === env.JWT_KEY) {
        errors.push('APP_KEY and JWT_KEY must be different for security');
    }

    // Production-specific checks
    if (process.env.NODE_ENV === 'production') {
        if (!env.COOKIE_DOMAIN) {
            warnings.push('COOKIE_DOMAIN should be set in production');
        }

        if (env.SESSION_VALIDATE_IP !== 'true') {
            warnings.push('SESSION_VALIDATE_IP should be enabled in production');
        }
    }

    return { errors, warnings };
}

/**
 * Get security headers for session management
 */
function getSecurityHeaders() {
    return {
        ...sessionSecurityConfig.headers,
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
}

/**
 * Session security utilities
 */
const sessionUtils = {
    /**
     * Generate secure session ID
     */
    generateSessionId: () => {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    },

    /**
     * Validate session ID format
     */
    validateSessionId: (sessionId) => {
        return /^[a-f0-9]{64}$/.test(sessionId);
    },

    /**
     * Generate session fingerprint
     */
    generateFingerprint: (req) => {
        const crypto = require('crypto');
        const data = [
            req.get('User-Agent'),
            req.ip,
            req.get('Accept-Language'),
            req.get('Accept-Encoding')
        ].join('|');
        
        return crypto.createHash('sha256').update(data).digest('hex');
    },

    /**
     * Check if session is expired
     */
    isSessionExpired: (session) => {
        if (!session.createdAt) return true;
        
        const sessionAge = Date.now() - session.createdAt;
        return sessionAge > sessionSecurityConfig.security.maxAge;
    },

    /**
     * Check if session is timed out
     */
    isSessionTimedOut: (session) => {
        if (!session.lastActivity) return true;
        
        const timeSinceLastActivity = Date.now() - session.lastActivity;
        return timeSinceLastActivity > sessionSecurityConfig.security.timeout;
    }
};

module.exports = {
    sessionSecurityConfig,
    getSessionConfig,
    validateSessionConfig,
    getSecurityHeaders,
    sessionUtils
}; 