const PasswordValidator = require('../utils/passwordValidator');
const PasswordHistory = require('../models/PasswordHistory');
const { json } = require('../utils/jsonresponse');

/**
 * Password Security Middleware
 * Enforces password policies and prevents common bypasses
 */
class PasswordSecurityMiddleware {
    
    /**
     * Validate password strength middleware
     * @param {object} options - Validation options
     * @returns {function} Middleware function
     */
    static validatePasswordStrength(options = {}) {
        return (req, res, next) => {
            const { password } = req.body;
            
            if (!password) {
                return json(res, 400, "Password is required");
            }

            const validation = PasswordValidator.validatePassword(password, options);
            
            if (!validation.isValid) {
                return json(res, 400, `Password validation failed: ${validation.errors.join(', ')}`);
            }

            // Add password strength to request for logging
            req.passwordStrength = validation.strength;
            req.passwordStrengthDescription = PasswordValidator.getStrengthDescription(validation.strength);
            
            next();
        };
    }

    /**
     * Check password history middleware
     * @param {number} limit - Number of recent passwords to check
     * @returns {function} Middleware function
     */
    static checkPasswordHistory(limit = 5) {
        return async (req, res, next) => {
            const { password } = req.body;
            const userId = req.user?.id || req.body.userId;

            if (!userId || !password) {
                return next();
            }

            try {
                const historyCheck = await PasswordHistory.checkPasswordHistory(userId, password, limit);
                
                if (historyCheck.isReused) {
                    return json(res, 400, `Password was recently used. Please choose a different password.`);
                }
                
                next();
            } catch (error) {
                return json(res, 500, "Error checking password history");
            }
        };
    }

    /**
     * Prevent password reuse middleware
     * @returns {function} Middleware function
     */
    static preventPasswordReuse() {
        return async (req, res, next) => {
            const { oldPassword, newPassword } = req.body;
            const userId = req.user?.id;

            if (!userId || !oldPassword || !newPassword) {
                return next();
            }

            try {
                // Check if new password is same as old password
                const User = require('../models/User');
                const user = await User.findById(userId);
                
                if (!user) {
                    return json(res, 404, "User not found");
                }

                const isSamePassword = await user.isValidPassword(newPassword);
                if (isSamePassword) {
                    return json(res, 400, "New password must be different from current password");
                }

                next();
            } catch (error) {
                return json(res, 500, "Error checking password");
            }
        };
    }

    /**
     * Rate limit password attempts middleware
     * @param {object} options - Rate limiting options
     * @returns {function} Middleware function
     */
    static rateLimitPasswordAttempts(options = {}) {
        const { maxAttempts = 5, windowMs = 15 * 60 * 1000 } = options; // 15 minutes
        
        const attempts = new Map();

        return (req, res, next) => {
            const key = req.ip || req.connection.remoteAddress;
            const now = Date.now();
            
            if (!attempts.has(key)) {
                attempts.set(key, { count: 0, resetTime: now + windowMs });
            }

            const attempt = attempts.get(key);
            
            // Reset if window has passed
            if (now > attempt.resetTime) {
                attempt.count = 0;
                attempt.resetTime = now + windowMs;
            }

            // Check if limit exceeded
            if (attempt.count >= maxAttempts) {
                return json(res, 429, `Too many password attempts. Please try again in ${Math.ceil((attempt.resetTime - now) / 1000 / 60)} minutes.`);
            }

            // Increment attempt count
            attempt.count++;

            // Add attempt info to response headers
            res.set('X-RateLimit-Limit', maxAttempts);
            res.set('X-RateLimit-Remaining', Math.max(0, maxAttempts - attempt.count));
            res.set('X-RateLimit-Reset', Math.ceil(attempt.resetTime / 1000));

            next();
        };
    }

    /**
     * Log password change attempts middleware
     * @returns {function} Middleware function
     */
    static logPasswordAttempts() {
        return (req, res, next) => {
            const { password } = req.body;
            const userId = req.user?.id;
            const ip = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent');

            if (password && userId) {
                // Log password change attempt (without logging the actual password)
                console.log(`Password change attempt - User: ${userId}, IP: ${ip}, Strength: ${req.passwordStrength || 'unknown'}`);
                
                // You could also log to a database or external service here
            }

            next();
        };
    }

    /**
     * Enforce password expiration middleware
     * @param {number} maxAgeDays - Maximum password age in days
     * @returns {function} Middleware function
     */
    static enforcePasswordExpiration(maxAgeDays = 90) {
        return async (req, res, next) => {
            const userId = req.user?.id;

            if (!userId) {
                return next();
            }

            try {
                const PasswordHistory = require('../models/PasswordHistory');
                const latestPassword = await PasswordHistory.findOne({ userId })
                    .sort({ changedAt: -1 })
                    .select('changedAt');

                if (latestPassword) {
                    const daysSinceChange = (Date.now() - latestPassword.changedAt.getTime()) / (1000 * 60 * 60 * 24);
                    
                    if (daysSinceChange > maxAgeDays) {
                        return json(res, 403, `Password expired. Please change your password. Password was last changed ${Math.floor(daysSinceChange)} days ago.`);
                    }
                }

                next();
            } catch (error) {
                return next(); // Continue if there's an error checking expiration
            }
        };
    }

    /**
     * Comprehensive password security middleware
     * Combines all password security checks
     * @param {object} options - Security options
     * @returns {function} Middleware function
     */
    static comprehensivePasswordSecurity(options = {}) {
        const {
            validateStrength = true,
            checkHistory = true,
            preventReuse = true,
            rateLimit = true,
            logAttempts = true,
            enforceExpiration = true,
            maxAgeDays = 90,
            maxAttempts = 5,
            windowMs = 15 * 60 * 1000
        } = options;

        const middlewares = [];

        if (validateStrength) {
            middlewares.push(this.validatePasswordStrength());
        }

        if (checkHistory) {
            middlewares.push(this.checkPasswordHistory());
        }

        if (preventReuse) {
            middlewares.push(this.preventPasswordReuse());
        }

        if (rateLimit) {
            middlewares.push(this.rateLimitPasswordAttempts({ maxAttempts, windowMs }));
        }

        if (logAttempts) {
            middlewares.push(this.logPasswordAttempts());
        }

        if (enforceExpiration) {
            middlewares.push(this.enforcePasswordExpiration(maxAgeDays));
        }

        return middlewares;
    }
}

module.exports = PasswordSecurityMiddleware; 