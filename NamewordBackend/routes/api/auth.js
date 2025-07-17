const router = require("express").Router();
const { 
    authLimiter, 
    registrationLimiter, 
    passwordResetLimiter, 
    emailLimiter, 
    smsLimiter, 
    accountLimiter, 
    uploadLimiter,
    burstLimiter 
} = require('../../app/middlewares/rate-limiter');
const { loginRules , registerRules, emailRules, passwordResetRules, telegramRegisterRules, updateUserRules, 
    verifyEmailRules, changePasswordRules, updateUserDetailsRules, accountReactivateRules, 
    sendMobileOtpRules,
    verifyMobileOtpRules
} = require('../../app/validations');
const LoginController = require('../../app/controllers/auth/LoginController');
const RegisterController = require('../../app/controllers/auth/RegisterController');
const SocialAuthController = require('../../app/controllers/auth/SocialAuthController');
const PasswordResetController = require('../../app/controllers/auth/PasswordResetController');
const VerificationController = require("../../app/controllers/auth/VerificationController");
const validateRequest = require('../../app/middlewares/validate-request');
const { currentUser, requireAuth } = require('../../app/middlewares/auth');
const { checkMissingEmail, updateUser } = require("../../app/controllers/telegram/TelegramController");
const { getUserDataMiddleware } = require("../../app/middlewares/user");
const UserController = require("../../app/controllers/auth/UserController");
const CsrfController = require("../../app/controllers/auth/CsrfController");
const PasswordSecurityMiddleware = require("../../app/middlewares/password-security");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post("/register", registrationLimiter, uploadLimiter, upload.single('profileImg'), registerRules, validateRequest, RegisterController.register);
router.post("/register-telegram-user", registrationLimiter, telegramRegisterRules, validateRequest, RegisterController.registerTelegramUser)
router.post("/login", authLimiter, loginRules, validateRequest, LoginController.login);
router.get("/me", currentUser, requireAuth, LoginController.currentUser);
router.post("/logout", currentUser, requireAuth, LoginController.logout);
// router.post("/forgot-password", emailRules, validateRequest, PasswordResetController.sendResetLink);
router.post("/reset-password", 
    passwordResetLimiter, 
    ...PasswordSecurityMiddleware.comprehensivePasswordSecurity({
        validateStrength: true,
        checkHistory: true,
        preventReuse: false, // Not applicable for password reset
        rateLimit: true,
        logAttempts: true,
        enforceExpiration: false // Not applicable for password reset
    }),
    passwordResetRules, 
    validateRequest, 
    PasswordResetController.resetPassword
);
router.post("/change-password", 
    currentUser, 
    requireAuth, 
    accountLimiter, 
    ...PasswordSecurityMiddleware.comprehensivePasswordSecurity({
        validateStrength: true,
        checkHistory: true,
        preventReuse: true,
        rateLimit: true,
        logAttempts: true,
        enforceExpiration: true
    }),
    changePasswordRules, 
    validateRequest, 
    UserController.changePassword
);
router.post("/telegram", SocialAuthController.telegramCallback);
router.post("/send-email-code", emailLimiter, emailRules, validateRequest, VerificationController.sendEmailVerificationCode);
router.post("/send-mobile-otp", smsLimiter, sendMobileOtpRules, validateRequest, VerificationController.sendMobileOTP);
router.post("/verify-mobile-otp", smsLimiter, verifyMobileOtpRules, validateRequest, VerificationController.verifyMobileOTP);
router.post("/verify-email-code", emailLimiter, verifyEmailRules, validateRequest, VerificationController.verifyEmailVerificationCode);
router.post("/update-userDetails", currentUser, requireAuth, updateUserDetailsRules, validateRequest, UserController.updateUserDetails);
router.post("/deactivate-account", currentUser, requireAuth, accountLimiter, UserController.deactivateAccount);
router.delete("/delete-account", currentUser, requireAuth, accountLimiter, UserController.deleteUserAccount);
router.post("/request-account-reactivate", emailLimiter, emailRules, validateRequest, UserController.sendReactivateAccountLink);
router.post("/reactivate-account", accountLimiter, accountReactivateRules, validateRequest, UserController.reactivateAccount);
router.post("/update-profile-picture", currentUser, requireAuth, uploadLimiter, upload.single('profileImg'), UserController.updateProfilePicture);
router.post("/delete-profile-picture", currentUser, requireAuth, UserController.deleteProfilePicture);

// Check if the user has an email, and request it if missing
router.get("/check-missing-email", getUserDataMiddleware, checkMissingEmail);

// Update email for a Telegram user
router.post("/update-user", updateUserRules, validateRequest, getUserDataMiddleware, updateUser);

// CSRF Protection Routes
router.get("/csrf-token", CsrfController.getCsrfToken);
router.post("/validate-csrf", CsrfController.validateCsrfToken);

module.exports = router;