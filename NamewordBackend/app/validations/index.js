
const { query, param, body } = require('express-validator');
const { checkIfEmailExists, checkIfPasswordMatch, checkIfMobileExists, checkIfAdminEmailExists, checkIfUserNameExists } = require('./custom_rule');
const InputValidator = require('../utils/inputValidator');
const PasswordValidator = require('../utils/passwordValidator');

module.exports.registerRules = [
    ...InputValidator.string('name', 'body', { minLength: 2, maxLength: 100 }),
    ...InputValidator.email('email', 'body'),
    body('email').custom(checkIfEmailExists),
    ...InputValidator.phone('mobile', 'body'),
    body('mobile').custom(checkIfMobileExists),
    ...InputValidator.string('username', 'body', { minLength: 3, maxLength: 50 }),
    body('username').custom(checkIfUserNameExists),
    ...PasswordValidator.passwordValidation('password', 'body'),
    ...PasswordValidator.passwordConfirmationValidation('password', 'passwordConfirmation'),
];

module.exports.telegramRegisterRules = [
    body('telegramId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    body('email').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isEmail().withMessage("The email field must be a valid email address."),
];

module.exports.adminRegisterRules = [
    body('name').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    body('email').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isEmail().withMessage("The email field must be a valid email address.")
        .custom(checkIfAdminEmailExists),
    ...PasswordValidator.passwordValidation('password', 'body', { minLength: 16 }), // Stricter for admin
    ...PasswordValidator.passwordConfirmationValidation('password', 'passwordConfirmation'),
];

module.exports.loginRules = [
    ...InputValidator.email('email', 'body'),
    ...InputValidator.string('password', 'body', { minLength: 8, maxLength: 128 }),
];

module.exports.emailRules = [
    body('email').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isEmail().withMessage("The email field must be a valid email address."),
];

module.exports.sendMobileOtpRules = [
    body('mobile').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isMobilePhone().withMessage("The mobile field must be a valid phone number."),
];

module.exports.verifyMobileOtpRules = [
    body('mobile').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isMobilePhone().withMessage("The mobile field must be a valid phone number."),
    body('otp').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isNumeric().withMessage("The otp field must be a numeric value")
        .isLength({ min: 6, max: 6 }).withMessage("The OTP should be 6 digits")
];

module.exports.verifyEmailRules = [
    body('email').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isEmail().withMessage("The email field must be a valid email address."),
    body('otp').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isNumeric().withMessage("The otp field must be a numeric value")
        .isLength({ min: 4, max: 4 }).withMessage("The OTP should be 4 digits")
];

module.exports.passwordResetRules = [
    ...InputValidator.email('email', 'body'),
    ...PasswordValidator.passwordValidation('password', 'body'),
    ...PasswordValidator.passwordConfirmationValidation('password', 'passwordConfirmation'),
    ...InputValidator.number('otp', 'body', { isInt: true, min: 1000, max: 9999 }),
];

module.exports.changePasswordRules = [
    ...InputValidator.string('oldPassword', 'body', { minLength: 8, maxLength: 128 }),
    ...PasswordValidator.passwordValidation('newPassword', 'body'),
    ...PasswordValidator.passwordConfirmationValidation('newPassword', 'newPasswordConfirmation'),
]

module.exports.updateUserDetailsRules = [
    body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters long.")
        .isString().withMessage("Name must be a valid string.")
        .custom((value) => {
            if (value && /<[^>]*>/.test(value)) {
                throw new Error("Name contains invalid HTML");
            }
            return true;
        }),

    body("email").optional().trim().isEmail().withMessage("The email must be a valid email address.")
        .custom((value) => {
            if (value && /[<>\"'&]/.test(value)) {
                throw new Error("Email contains invalid characters");
            }
            return true;
        }),
    body("mobile").optional().trim().isMobilePhone('any', { strictMode: true }).withMessage("The mobile field must be a valid number."),
    body("username").optional().trim().isLength({ min: 3, max: 50 }).withMessage("Username must be between 3 and 50 characters long.")
        .isString().withMessage("Username must be a valid string.")
        .custom((value) => {
            if (value && /[<>\"'&]/.test(value)) {
                throw new Error("Username contains invalid characters");
            }
            return true;
        }),
    body('enabled2FA').optional().trim().isBoolean().withMessage("The enabled2FA field should be true or false."),
    body('notifyEmail').optional().trim().isBoolean().withMessage("The notifyEmail field should be true or false."),
    body('notifySMS').optional().trim().isBoolean().withMessage("The notifySMS field should be true or false."),
];

module.exports.accountReactivateRules = [
    body('email').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isEmail().withMessage("The email field must be a valid email address."),
    body('token').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
]

module.exports.domainSearchRules = [
    query('websiteName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('renewalFeePerc').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isInt().withMessage((_, { path }) => `The ${path} field should be integer.`),
    query('transferFeePerc').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isInt().withMessage((_, { path }) => `The ${path} field should be integer.`),
    query('registrationFeePerc').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isInt().withMessage((_, { path }) => `The ${path} field should be integer.`),
];

module.exports.domainOrderRules = [
    query('productType').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isInt().withMessage((_, { path }) => `The ${path} field should be integer.`),
    query('websiteName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('duration').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isInt().withMessage((_, { path }) => `The ${path} field should be integer.`),
    query('isWhoisProtection').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isBoolean().withMessage((_, { path }) => `The ${path} field should be true or false.`),
    query('ns1').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('ns2').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('id').trim().optional()
        .isInt().withMessage((_, { path }) => `The ${path} field should be integer.`),
    query('handle').trim().optional(),    
    query('isEnablePremium').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isIn([1, 0]).withMessage((_, { path }) => `The ${path} should be 1 or 0.`),
];

module.exports.domainTLDOrderRules = [
    ...this.domainOrderRules,
    query('isUs').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('appPurpose').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .toUpperCase()
        .isIn(['P1', 'P2', 'P3', 'P4']).withMessage((_, { path }) => `The ${path} should be P1, P2, P3 or P4.`),
    query('nexusCategory').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .toUpperCase()
        .isIn(['C11', 'C12', 'C21', 'C31/CC', 'C32/CC']).withMessage((_, { path }) => `The ${path} should be C11, C12, C21, C31/CC orC32/CC'`),
];


module.exports.domainTransferRules = [
    query('orderType').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isInt().withMessage((_, { path }) => `The ${path} field should be integer.`),
    query('websiteName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('isWhoisProtection').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isBoolean().withMessage((_, { path }) => `The ${path} field should be true or false.`),
    query('authCode').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('id').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isInt().withMessage((_, { path }) => `The ${path} field should be integer.`),
];

module.exports.domainRenewRules = [
    query('orderType').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isInt().withMessage((_, { path }) => `The ${path} field should be integer.`),
    query('websiteName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('isWhoisProtection').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isBoolean().withMessage((_, { path }) => `The ${path} field should be true or false.`),
    query('duration').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('id').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isInt().withMessage((_, { path }) => `The ${path} field should be integer.`),
];


module.exports.mongoIdRules = [
    param('id').trim().isMongoId().withMessage((_, { path }) => `The ${path} field is not valid.`)
];

module.exports.getMongoIdRule = (field) => {
    return [
        param(field).trim().isMongoId().withMessage((_, { path }) => `The ${path} field is not valid.`)
    ];
};

module.exports.domainSuggestionRules = [
    query('keyword').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage("The limit should be between 1-50.").toInt(),
];

module.exports.domainRequiredRules = [
    query('domain').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
];

module.exports.domainNameIdRequiredRules = [
    query('domainNameId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
];

module.exports.websiteNameRequiredRules = [
    query('websiteName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
];

module.exports.websiteIDRequiredRules = [
    query('websiteId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
];


module.exports.addDnsRules = [
    query('dnsZoneId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('recordName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('recordType').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('recordValue').optional(),
    query('recordPriority').optional(),
    query('recordTTL').optional(),
];

module.exports.modifyDnsRules = [
    query('dnsZoneId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('dnsZoneRecordId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('recordName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('recordType').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('recordValue').optional(),
    query('recordTTL').optional(),
];

module.exports.deleteDnsRules = [
    query('dnsZoneId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('dnsZoneRecordId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
];

module.exports.addChildNameServerRules = [
    query('domainNameId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('websiteName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('hostName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('ipAddress').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isIP().withMessage("IP address is not valid"),
];

module.exports.modifyChildNameServerIPRules = [
    query('domainNameId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('websiteName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('hostName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('newIpAddress').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isIP().withMessage("IP address is not valid"),
    query('oldIpAddress').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isIP().withMessage("IP address is not valid"),
];

module.exports.modifyChildNameServerHostRules = [
    query('domainNameId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('websiteName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('oldHostName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('newHostName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
];

module.exports.deleteChildNameServerRules = [
    query('domainNameId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('websiteName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('hostName').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
];

module.exports.setDomainForwardRules = [
    query('domainNameId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isInt().withMessage((_, { path }) => `The ${path} field should be integer.`),
    query('websiteId').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
    query('isMasking').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`)
        .isIn([1, 0]).withMessage((_, { path }) => `The ${path} should be 1 or 0.`),
    query('rewrite').trim().notEmpty().withMessage((_, { path }) => `The ${path} field is required.`),
];

module.exports.updateUserRules = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long.")
        .isString().withMessage("Name must be a valid string."),

    body("email")
        .optional()
        .trim()
        .isEmail().withMessage("The email must be a valid email address."),

    body("banned")
        .optional()
        .isBoolean().withMessage("Banned must be a boolean value (true/false)."),
];