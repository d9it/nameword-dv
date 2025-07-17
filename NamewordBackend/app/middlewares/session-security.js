/**
 * Comprehensive Session Security Middleware
 * Addresses session security vulnerabilities and implements best practices
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { sessionizeUser } = require('../utils/common');
const ForbiddenError = require('../errors/ForbiddenError');
const NotAuthorizedError = require('../errors/NotAuthorizedError');
const { getSessionConfig, sessionUtils, validateSessionConfig } = require('../config/session-security');
const { Logger } = require('../utils/logger');

/**
 * Session Security Configuration
 */
class SessionSecurity {
    /**
     * Enhanced session configuration with security best practices
     */
    static getSessionConfig() {
        return getSessionConfig();
    }

    /**
     * Generate secure session ID
     */
    static generateSessionId() {
        return sessionUtils.generateSessionId();
    }

    /**
     * Validate session security
     */
    static validateSession(req, res, next) {
        try {
            // Check if session exists
            if (!req.session) {
                return next(new NotAuthorizedError('Invalid session'));
            }

            // Validate session ID format
            if (req.sessionID && !sessionUtils.validateSessionId(req.sessionID)) {
                return next(new NotAuthorizedError('Invalid session ID'));
            }

            // Check session age
            if (sessionUtils.isSessionExpired(req.session)) {
                this.invalidateSession(req, res);
                return next(new NotAuthorizedError('Session expired'));
            }

            // Validate user agent consistency
            if (req.session.userAgent && req.session.userAgent !== req.get('User-Agent')) {
                this.invalidateSession(req, res);
                return next(new NotAuthorizedError('Session hijacking detected'));
            }

            // Validate IP consistency (if enabled)
            if (process.env.SESSION_VALIDATE_IP === 'true' && req.session.clientIP) {
                if (req.session.clientIP !== req.ip) {
                    this.invalidateSession(req, res);
                    return next(new NotAuthorizedError('IP address changed'));
                }
            }

            next();
        } catch (error) {
            Logger.error('Session validation error:', error);
            this.invalidateSession(req, res);
            return next(new NotAuthorizedError('Session validation failed'));
        }
    }

    /**
     * Initialize secure session
     */
    static initializeSession(req, res, next) {
        try {
            // Set session creation time
            if (!req.session.createdAt) {
                req.session.createdAt = Date.now();
            }

            // Store client information
            req.session.userAgent = req.get('User-Agent');
            req.session.clientIP = req.ip;
            req.session.lastActivity = Date.now();

            // Generate session fingerprint
            req.session.fingerprint = this.generateSessionFingerprint(req);

            next();
        } catch (error) {
            Logger.error('Session initialization error:', error);
            // Continue without session security rather than crashing
            next();
        }
    }

    /**
     * Generate session fingerprint for security
     */
    static generateSessionFingerprint(req) {
        const data = [
            req.get('User-Agent'),
            req.ip,
            req.get('Accept-Language'),
            req.get('Accept-Encoding')
        ].join('|');
        
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Rotate session after successful authentication
     */
    static async rotateSession(req, res, user, isAdmin = false) {
        try {
            // Store current session data
            const currentData = {
                jwt: req.session.jwt,
                adminjwt: req.session.adminjwt,
                createdAt: req.session.createdAt,
                userAgent: req.session.userAgent,
                clientIP: req.session.clientIP
            };

            // Regenerate session with proper promise handling
            return new Promise((resolve, reject) => {
                req.session.regenerate((err) => {
                    if (err) {
                        Logger.error('Session regeneration failed:', err);
                        reject(new Error('Session regeneration failed'));
                        return;
                    }

                    try {
                        // Restore essential data
                        req.session.createdAt = Date.now();
                        req.session.userAgent = currentData.userAgent;
                        req.session.clientIP = currentData.clientIP;
                        req.session.fingerprint = this.generateSessionFingerprint(req);
                        req.session.lastActivity = Date.now();

                        // Set new JWT
                        if (isAdmin) {
                            req.session.adminjwt = this.generateSecureJWT(user, 'admin');
                        } else {
                            req.session.jwt = this.generateSecureJWT(user, 'user');
                        }

                        // Log session rotation
                        Logger.info(`Session rotated for ${isAdmin ? 'admin' : 'user'}: ${user.id}`);
                        resolve();
                    } catch (error) {
                        Logger.error('Error during session rotation:', error);
                        reject(error);
                    }
                });
            });
        } catch (error) {
            Logger.error('Session rotation error:', error);
            throw error;
        }
    }

    /**
     * Generate secure JWT with additional claims
     */
    static generateSecureJWT(user, type = 'user') {
        const payload = {
            id: user.id,
            email: user.email,
            type: type,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
            jti: crypto.randomBytes(16).toString('hex') // JWT ID for uniqueness
        };

        return jwt.sign(payload, process.env.JWT_KEY, {
            algorithm: 'HS256',
            issuer: 'nameword-backend',
            audience: type === 'admin' ? 'admin' : 'user'
        });
    }

    /**
     * Validate JWT with enhanced security
     */
    static validateJWT(token, type = 'user') {
        try {
            const payload = jwt.verify(token, process.env.JWT_KEY, {
                algorithms: ['HS256'],
                issuer: 'nameword-backend',
                audience: type === 'admin' ? 'admin' : 'user'
            });

            // Check token expiration
            if (payload.exp && Date.now() >= payload.exp * 1000) {
                throw new Error('Token expired');
            }

            // Check token age
            const tokenAge = Date.now() - (payload.iat * 1000);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (tokenAge > maxAge) {
                throw new Error('Token too old');
            }

            return payload;
        } catch (error) {
            throw new NotAuthorizedError('Invalid or expired token');
        }
    }

    /**
     * Invalidate session completely
     */
    static invalidateSession(req, res) {
        if (req.session) {
            // Clear all session data
            req.session.destroy((err) => {
                if (err) {
                    Logger.error('Session destruction failed:', err);
                }
            });
        }

        // Clear cookies
        res.clearCookie('bozzname-server');
        res.clearCookie('X-CSRF-Token');
    }

    /**
     * Update session activity
     */
    static updateSessionActivity(req) {
        if (req.session) {
            req.session.lastActivity = Date.now();
        }
    }

    /**
     * Check session timeout
     */
    static checkSessionTimeout(req, res, next) {
        try {
            if (!req.session || !req.session.lastActivity) {
                return next();
            }

            const timeout = 30 * 60 * 1000; // 30 minutes
            const timeSinceLastActivity = Date.now() - req.session.lastActivity;

            if (timeSinceLastActivity > timeout) {
                this.invalidateSession(req, res);
                return next(new NotAuthorizedError('Session timeout'));
            }

            // Update activity
            this.updateSessionActivity(req);
            next();
        } catch (error) {
            Logger.error('Session timeout check error:', error);
            // Continue without timeout check rather than crashing
            next();
        }
    }

    /**
     * Session security middleware
     */
    static middleware(req, res, next) {
        // Initialize session security
        this.initializeSession(req, res, () => {
            // Validate session
            this.validateSession(req, res, () => {
                // Check timeout
                this.checkSessionTimeout(req, res, next);
            });
        });
    }

    /**
     * Enhanced authentication with session security
     */
    static async authenticateUser(req, res, next) {
        try {
            // Extract token
            const token = this.extractToken(req);
            if (!token) {
                return next();
            }

            // Validate token
            const payload = this.validateJWT(token, 'user');
            
            // Find user
            const user = await User.findById(payload.id).select("-password");
            if (!user) {
                this.invalidateSession(req, res);
                return next();
            }

            // Check user status
            if (user.banned) {
                throw new ForbiddenError("Your account has been banned. Please contact support for further assistance.");
            }
            if (user.deactivated) {
                throw new ForbiddenError("Your account has been deactivated. Please contact support for further assistance.");
            }

            // Set user in request
            req.user = sessionizeUser(user);
            
            // Update session activity
            this.updateSessionActivity(req);

            next();
        } catch (error) {
            this.invalidateSession(req, res);
            next(error);
        }
    }

    /**
     * Enhanced admin authentication with session security
     */
    static async authenticateAdmin(req, res, next) {
        try {
            // Extract admin token
            const token = req.session?.adminjwt;
            if (!token) {
                return next();
            }

            // Validate token
            const payload = this.validateJWT(token, 'admin');
            
            // Find admin
            const admin = await Admin.findById(payload.id).select("-password");
            if (!admin) {
                this.invalidateSession(req, res);
                return next();
            }

            // Set admin in request
            req.admin = { id: admin.id, email: admin.email };
            
            // Update session activity
            this.updateSessionActivity(req);

            next();
        } catch (error) {
            this.invalidateSession(req, res);
            next(error);
        }
    }

    /**
     * Extract token from multiple sources
     */
    static extractToken(req) {
        // Try Authorization header first
        const authHeader = req.headers["authorization"];
        if (authHeader && authHeader.startsWith("Bearer ")) {
            return authHeader.split(" ")[1];
        }

        // Try session JWT
        if (req.session?.jwt) {
            return req.session.jwt;
        }

        return null;
    }

    /**
     * Logout with proper session cleanup
     */
    static logout(req, res, next) {
        // Log logout event
        Logger.info(`User logout: ${req.user?.id || req.admin?.id}`);
        
        // Invalidate session
        this.invalidateSession(req, res);
        
        return res.json({ success: true, message: 'Logged out successfully' });
    }
}

module.exports = SessionSecurity;

// Backward compatibility exports for existing code
module.exports.currentUser = SessionSecurity.authenticateUser;
module.exports.currentAdmin = SessionSecurity.authenticateAdmin;
module.exports.requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }
    next();
};
module.exports.requireAdminAuth = (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({ success: false, message: "Admin authentication required" });
    }
    next();
}; 