/**
 * Secure Development Configuration Utility
 * 
 * This utility provides secure configuration options for different environments
 * while maintaining security best practices.
 */

const winston = require('winston');

class SecureConfig {
    /**
     * Get secure logging configuration
     * @param {string} environment - Current environment
     * @returns {Object} Logging configuration
     */
    static getLoggingConfig(environment = process.env.NODE_ENV) {
        const isProduction = environment === 'production';
        const isDevelopment = environment === 'development';
        const isTest = environment === 'test';

        return {
            // Production: Structured logging with minimal sensitive data
            production: {
                level: 'info',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.errors({ stack: false }), // No stack traces in production
                    winston.format.json()
                ),
                defaultMeta: { service: 'nameword-backend' },
                transports: [
                    new winston.transports.Console({
                        format: winston.format.combine(
                            winston.format.colorize(),
                            winston.format.simple()
                        )
                    })
                ]
            },
            
            // Development: More verbose but still secure
            development: {
                level: 'debug',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.colorize(),
                    winston.format.simple()
                ),
                transports: [
                    new winston.transports.Console()
                ]
            },
            
            // Test: Minimal logging
            test: {
                level: 'error',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.simple()
                ),
                transports: [
                    new winston.transports.Console()
                ]
            }
        }[environment] || {
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            ),
            transports: [
                new winston.transports.Console()
            ]
        };
    }

    /**
     * Get secure database configuration
     * @param {string} environment - Current environment
     * @returns {Object} Database configuration
     */
    static getDatabaseConfig(environment = process.env.NODE_ENV) {
        return {
            // Always use secure settings regardless of environment
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Never enable debug mode in any environment
            debug: false,
            // Connection pool settings
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            // SSL/TLS settings
            ssl: environment === 'production',
            sslValidate: true,
            // Authentication settings
            authSource: 'admin',
            // Write concern for data safety
            w: 'majority',
            j: true
        };
    }

    /**
     * Get secure TLS configuration
     * @param {string} environment - Current environment
     * @returns {Object} TLS configuration
     */
    static getTLSConfig(environment = process.env.NODE_ENV) {
        return {
            // Always validate certificates
            rejectUnauthorized: true,
            // Use secure protocols
            minVersion: 'TLSv1.2',
            maxVersion: 'TLSv1.3',
            // Cipher suites
            ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256',
            // Honor cipher order
            honorCipherOrder: true
        };
    }

    /**
     * Get secure session configuration
     * @param {string} environment - Current environment
     * @returns {Object} Session configuration
     */
    static getSessionConfig(environment = process.env.NODE_ENV) {
        const isProduction = environment === 'production';
        
        return {
            // Always use secure settings
            secure: isProduction,
            httpOnly: true,
            sameSite: isProduction ? 'strict' : 'lax',
            signed: true,
            // Session timeout
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            // Domain restrictions
            domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
            // Path restrictions
            path: '/',
            // Secure headers
            overwrite: true
        };
    }

    /**
     * Get secure CORS configuration
     * @param {string} environment - Current environment
     * @returns {Object} CORS configuration
     */
    static getCORSConfig(environment = process.env.NODE_ENV) {
        // Cache parsed origins for efficiency
        const allowedOriginsSet = new Set(
            process.env.ALLOWED_ORIGINS ? 
                process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
                ['http://localhost:3000', 'http://localhost:5173']
        );

        return {
            origin: function (origin, callback) {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);
                
                // Use Set.has() for efficient origin checking
                if (allowedOriginsSet.has(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            allowedHeaders: [
                "Content-Type",
                "Authorization",
                "X-Requested-With",
                "X-API-Key",
                "X-CSRF-Token",
                "X-XSRF-Token",
            ],
            // Security headers
            exposedHeaders: [],
            // Optimize preflight caching
            maxAge: 86400, // 24 hours
            // Preflight continue for better performance
            preflightContinue: false,
            // Options success status
            optionsSuccessStatus: 204
        };
    }

    /**
     * Get cached CORS configuration for better performance
     * @param {string} environment - Current environment
     * @returns {Object} Cached CORS configuration
     */
    static getCachedCORSConfig(environment = process.env.NODE_ENV) {
        // Use module-level caching to avoid recreating configuration
        if (!this._corsConfigCache) {
            this._corsConfigCache = new Map();
        }

        const cacheKey = `${environment}-${process.env.ALLOWED_ORIGINS || 'default'}`;
        
        if (!this._corsConfigCache.has(cacheKey)) {
            this._corsConfigCache.set(cacheKey, this.getCORSConfig(environment));
        }

        return this._corsConfigCache.get(cacheKey);
    }

    /**
     * Validate CORS configuration for efficiency
     * @param {string} environment - Current environment
     * @returns {Object} Validation result
     */
    static validateCORSConfig(environment = process.env.NODE_ENV) {
        const issues = [];
        const warnings = [];

        // Check if ALLOWED_ORIGINS is set
        if (!process.env.ALLOWED_ORIGINS) {
            warnings.push('ALLOWED_ORIGINS not set, using default localhost origins');
        } else {
            // Validate origin format
            const origins = process.env.ALLOWED_ORIGINS.split(',');
            if (origins.length > 10) {
                warnings.push('Large number of CORS origins may impact performance');
            }

            // Check for invalid origins
            for (const origin of origins) {
                const trimmedOrigin = origin.trim();
                if (!trimmedOrigin) {
                    issues.push('Empty CORS origin found');
                    continue;
                }

                try {
                    const url = new URL(trimmedOrigin);
                    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                        issues.push(`Invalid CORS origin protocol: ${trimmedOrigin}`);
                    }
                } catch (error) {
                    issues.push(`Invalid CORS origin format: ${trimmedOrigin}`);
                }
            }
        }

        // Production-specific CORS checks
        if (environment === 'production') {
            if (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.includes('localhost')) {
                warnings.push('Localhost origins in production CORS configuration');
            }

            if (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.includes('*')) {
                issues.push('Wildcard (*) CORS origin not allowed in production');
            }
        }

        return {
            isValid: issues.length === 0,
            issues,
            warnings
        };
    }

    /**
     * Validate environment configuration
     * @param {string} environment - Current environment
     * @returns {Object} Validation result
     */
    static validateEnvironment(environment = process.env.NODE_ENV) {
        const issues = [];
        const warnings = [];

        // Check for insecure settings
        if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
            issues.push('NODE_TLS_REJECT_UNAUTHORIZED is disabled - security risk');
        }

        if (process.env.NODE_ENV === 'development' && process.env.DEBUG) {
            warnings.push('Debug mode enabled in development - ensure no sensitive data is logged');
        }

        // Check for required production settings
        if (environment === 'production') {
            if (!process.env.APP_KEY || process.env.APP_KEY.length < 32) {
                issues.push('Weak APP_KEY in production');
            }
            
            if (!process.env.JWT_KEY || process.env.JWT_KEY.length < 32) {
                issues.push('Weak JWT_KEY in production');
            }

            if (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.includes('localhost')) {
                warnings.push('Localhost origins allowed in production');
            }
        }

        // Validate CORS configuration
        const corsValidation = this.validateCORSConfig(environment);
        issues.push(...corsValidation.issues);
        warnings.push(...corsValidation.warnings);

        return {
            isValid: issues.length === 0,
            issues,
            warnings,
            environment
        };
    }

    /**
     * Get secure error handling configuration
     * @param {string} environment - Current environment
     * @returns {Object} Error handling configuration
     */
    static getErrorHandlingConfig(environment = process.env.NODE_ENV) {
        return {
            // Never expose stack traces in production
            includeStack: environment !== 'production',
            // Sanitize error messages
            sanitizeErrors: true,
            // Log errors securely
            logErrors: true,
            // Custom error messages
            customMessages: {
                'ValidationError': 'Invalid input provided',
                'CastError': 'Invalid data format',
                'MongoError': 'Database operation failed',
                'JsonWebTokenError': 'Authentication failed',
                'TokenExpiredError': 'Session expired'
            }
        };
    }
}

module.exports = SecureConfig; 