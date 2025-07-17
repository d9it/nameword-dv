const jwt = require("jsonwebtoken");
const json = require("../utils/jsonresponse");
const User = require("../models/User");
const Admin = require("../models/Admin");
const { sessionizeUser } = require('../utils/common');
const ForbiddenError = require('../errors/ForbiddenError');
const NotAuthorizedError = require('../errors/NotAuthorizedError');
const SessionSecurity = require('./session-security');

/**
 * Unified Authentication Middleware
 * Handles both user and admin authentication with consistent implementation
 * Now uses the enhanced SessionSecurity middleware
 */
class AuthMiddleware {
    /**
     * Extract JWT token from multiple sources (Authorization header, session)
     */
    static extractToken(req) {
        return SessionSecurity.extractToken(req);
    }

    /**
     * Verify JWT token and return payload
     */
    static verifyToken(token) {
        try {
            return SessionSecurity.validateJWT(token, 'user');
        } catch (error) {
            throw new NotAuthorizedError("Invalid or expired token");
        }
    }

    /**
     * Get user by ID with proper error handling
     */
    static async getUserById(id) {
        const user = await User.findById(id).select("-password");
        if (!user) {
            throw new NotAuthorizedError("User not found");
        }
        return user;
    }

    /**
     * Get admin by ID with proper error handling
     */
    static async getAdminById(id) {
        const admin = await Admin.findById(id).select("-password");
        if (!admin) {
            throw new NotAuthorizedError("Admin not found");
        }
        return admin;
    }

    /**
     * Check user account status
     */
    static validateUserStatus(user) {
        if (user.banned) {
            throw new ForbiddenError("Your account has been banned. Please contact support for further assistance.");
        }
        if (user.deactivated) {
            throw new ForbiddenError("Your account has been deactivated. Please contact support for further assistance.");
        }
    }

    /**
     * Current User Middleware - Sets req.user if valid token exists
     * Non-blocking - allows requests to continue without authentication
     */
    static async currentUser(req, res, next) {
        return SessionSecurity.authenticateUser(req, res, next);
    }

    /**
     * Current Admin Middleware - Sets req.admin if valid token exists
     * Non-blocking - allows requests to continue without authentication
     */
    static async currentAdmin(req, res, next) {
        return SessionSecurity.authenticateAdmin(req, res, next);
    }

    /**
     * Require User Authentication - Blocks requests without valid user
     */
    static requireUserAuth(req, res, next) {
        if (!req.user) {
            return json(res, 401, "Authentication required");
        }
        next();
    }

    /**
     * Require Admin Authentication - Blocks requests without valid admin
     */
    static requireAdminAuth(req, res, next) {
        if (!req.admin) {
            return json(res, 401, "Admin authentication required");
        }
        next();
    }

    /**
     * Role-based Authorization
     */
    static requireRole(...roles) {
        return (req, res, next) => {
            const user = req.user || req.admin;
            if (!user) {
                return json(res, 401, "Authentication required");
            }

            const userRole = user.role || 'user';
            if (!roles.includes(userRole)) {
                return json(res, 403, "Insufficient permissions");
            }

            next();
        };
    }

    /**
     * Legacy compatibility methods
     */
    static get isAuthenticated() {
        return this.requireUserAuth;
    }

    static get isAuthorized() {
        return this.requireRole;
    }

    static get currentUser() {
        return this.currentUser.bind(this);
    }

    static get currentAdmin() {
        return this.currentAdmin.bind(this);
    }

    static get requireAuth() {
        return this.requireUserAuth;
    }

    static get requireAdminAuth() {
        return this.requireAdminAuth;
    }
}

// Export for backward compatibility
module.exports = AuthMiddleware;
module.exports.currentUser = AuthMiddleware.currentUser.bind(AuthMiddleware);
module.exports.currentAdmin = AuthMiddleware.currentAdmin.bind(AuthMiddleware);
module.exports.requireAuth = AuthMiddleware.requireUserAuth;
module.exports.requireAdminAuth = AuthMiddleware.requireAdminAuth;
module.exports.requireRole = AuthMiddleware.requireRole;
