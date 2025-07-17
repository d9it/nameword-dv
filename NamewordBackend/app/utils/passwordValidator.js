const crypto = require('crypto');
const { body } = require('express-validator');

/**
 * Comprehensive Password Validation Utility
 * Enforces strong password policies and prevents common bypasses
 */
class PasswordValidator {
    
    // Common weak passwords to prevent
    static WEAK_PASSWORDS = [
        'password', '123456', 'qwerty', 'admin', 'letmein', 'welcome',
        'password123', '123456789', '12345678', '1234567', '1234567890',
        'qwerty123', 'admin123', 'letmein123', 'welcome123', 'test123',
        'guest', 'user', 'demo', 'sample', 'temp', 'temporary',
        'changeme', 'secret', 'private', 'secure', 'login', 'pass',
        'abc123', 'password1', 'password12', 'password1234', 'password12345'
    ];

    // Password strength requirements
    static PASSWORD_REQUIREMENTS = {
        minLength: 12,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventCommonPasswords: true,
        preventSequentialChars: true,
        preventRepeatingChars: true
    };

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @param {object} options - Validation options
     * @returns {object} Validation result
     */
    static validatePassword(password, options = {}) {
        const requirements = { ...this.PASSWORD_REQUIREMENTS, ...options };
        const errors = [];

        // Check length
        if (password.length < requirements.minLength) {
            errors.push(`Password must be at least ${requirements.minLength} characters long`);
        }

        if (password.length > requirements.maxLength) {
            errors.push(`Password must be no more than ${requirements.maxLength} characters long`);
        }

        // Check character requirements
        if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (requirements.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (requirements.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (requirements.requireSpecialChars && !/[@$!%*?&]/.test(password)) {
            errors.push('Password must contain at least one special character (@$!%*?&)');
        }

        // Check for common weak passwords
        if (requirements.preventCommonPasswords) {
            const normalizedPassword = password.toLowerCase();
            if (this.WEAK_PASSWORDS.includes(normalizedPassword)) {
                errors.push('Password is too common, please choose a stronger password');
            }
        }

        // Check for sequential characters
        if (requirements.preventSequentialChars) {
            const sequences = ['123', '234', '345', '456', '789', 'abc', 'bcd', 'cde', 'def'];
            const normalizedPassword = password.toLowerCase();
            for (const seq of sequences) {
                if (normalizedPassword.includes(seq)) {
                    errors.push('Password contains sequential characters');
                    break;
                }
            }
        }

        // Check for repeating characters
        if (requirements.preventRepeatingChars) {
            for (let i = 0; i < password.length - 2; i++) {
                if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
                    errors.push('Password contains too many repeating characters');
                    break;
                }
            }
        }

        // Check for keyboard patterns
        const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'edcrfv'];
        const normalizedPassword = password.toLowerCase();
        for (const pattern of keyboardPatterns) {
            if (normalizedPassword.includes(pattern)) {
                errors.push('Password contains keyboard patterns');
                break;
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            strength: this.calculatePasswordStrength(password)
        };
    }

    /**
     * Calculate password strength score (0-100)
     * @param {string} password - Password to score
     * @returns {number} Strength score
     */
    static calculatePasswordStrength(password) {
        let score = 0;

        // Length contribution
        score += Math.min(password.length * 4, 40);

        // Character variety contribution
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/\d/.test(password)) score += 10;
        if (/[@$!%*?&]/.test(password)) score += 10;

        // Bonus for mixed case
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 10;

        // Bonus for numbers and special chars
        if (/\d/.test(password) && /[@$!%*?&]/.test(password)) score += 10;

        // Penalty for common patterns
        const normalizedPassword = password.toLowerCase();
        if (this.WEAK_PASSWORDS.includes(normalizedPassword)) score -= 50;
        if (/123|234|345|456|789/.test(password)) score -= 20;
        if (/(.)\1{2,}/.test(password)) score -= 20;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Generate strong password
     * @param {number} length - Password length
     * @returns {string} Generated password
     */
    static generateStrongPassword(length = 16) {
        const charset = {
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            numbers: '0123456789',
            symbols: '@$!%*?&'
        };

        let password = '';

        // Ensure at least one character from each category
        password += this.getRandomChar(crypto.randomBytes(1)[0], charset.lowercase);
        password += this.getRandomChar(crypto.randomBytes(1)[0], charset.uppercase);
        password += this.getRandomChar(crypto.randomBytes(1)[0], charset.numbers);
        password += this.getRandomChar(crypto.randomBytes(1)[0], charset.symbols);

        // Fill the rest with random characters
        const allChars = charset.lowercase + charset.uppercase + charset.numbers + charset.symbols;
        for (let i = password.length; i < length; i++) {
            password += this.getRandomChar(crypto.randomBytes(1)[0], allChars);
        }

        // Shuffle the password
        return this.shuffleString(password);
    }

    /**
     * Get random character from charset
     * @param {number} randomByte - Random byte
     * @param {string} charset - Character set
     * @returns {string} Random character
     */
    static getRandomChar(randomByte, charset) {
        return charset[randomByte % charset.length];
    }

    /**
     * Shuffle string using Fisher-Yates algorithm
     * @param {string} str - String to shuffle
     * @returns {string} Shuffled string
     */
    static shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = crypto.randomBytes(1)[0] % (i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    /**
     * Express validator for password field
     * @param {string} field - Field name
     * @param {string} location - 'body', 'query', or 'param'
     * @param {object} options - Validation options
     * @returns {array} Validation rules
     */
    static passwordValidation(field, location = 'body', options = {}) {
        const requirements = { ...this.PASSWORD_REQUIREMENTS, ...options };
        
        return [
            body(field).trim().notEmpty().withMessage(`${field} is required`),
            body(field).isLength({ min: requirements.minLength, max: requirements.maxLength })
                .withMessage(`${field} must be between ${requirements.minLength} and ${requirements.maxLength} characters`),
            body(field).custom((value) => {
                const validation = this.validatePassword(value, requirements);
                if (!validation.isValid) {
                    throw new Error(validation.errors.join(', '));
                }
                return true;
            })
        ];
    }

    /**
     * Validate password confirmation
     * @param {string} passwordField - Password field name
     * @param {string} confirmationField - Confirmation field name
     * @returns {array} Validation rules
     */
    static passwordConfirmationValidation(passwordField, confirmationField) {
        return [
            body(confirmationField).trim().notEmpty().withMessage(`${confirmationField} is required`),
            body(confirmationField).custom((value, { req }) => {
                if (value !== req.body[passwordField]) {
                    throw new Error('Password confirmation does not match');
                }
                return true;
            })
        ];
    }

    /**
     * Check if password meets minimum requirements
     * @param {string} password - Password to check
     * @returns {boolean} Whether password meets minimum requirements
     */
    static meetsMinimumRequirements(password) {
        const validation = this.validatePassword(password, {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
            preventCommonPasswords: true,
            preventSequentialChars: false,
            preventRepeatingChars: false
        });
        return validation.isValid;
    }

    /**
     * Get password strength description
     * @param {number} strength - Strength score
     * @returns {string} Strength description
     */
    static getStrengthDescription(strength) {
        if (strength >= 80) return 'Very Strong';
        if (strength >= 60) return 'Strong';
        if (strength >= 40) return 'Moderate';
        if (strength >= 20) return 'Weak';
        return 'Very Weak';
    }
}

module.exports = PasswordValidator; 