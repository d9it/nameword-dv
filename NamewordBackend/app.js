const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const cookieSession = require("cookie-session");
const createError = require("http-errors");
const nunjucks = require("nunjucks");
const errorHandler = require("./app/middlewares/error-handler");
const { generateCsrfToken, validateCsrfToken, handleCsrfError } = require("./app/middlewares/csrf");
const { 
    authLimiter, 
    apiLimiter, 
    financialLimiter, 
    uploadLimiter, 
    burstLimiter,
    strictApiLimiter 
} = require("./app/middlewares/rate-limiter");
const InputValidator = require("./app/utils/inputValidator");
const { securityHeaders, helmetConfig, apiSecurityHeaders, adminSecurityHeaders } = require("./app/middlewares/security-headers");
const SessionSecurity = require("./app/middlewares/session-security");
const SecureConfig = require("./app/utils/secureConfig");
const { Logger } = require("./app/utils/logger");
const { 
    loggingMiddleware, 
    errorLoggingMiddleware, 
    securityLoggingMiddleware 
} = require("./app/middlewares/logging");

// Load environment variables securely
if (process.env.NODE_ENV !== "production") {
	dotenvExpand.expand(dotenv.config());
	// Remove insecure TLS setting - use proper certificate validation
	// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // REMOVED - Security risk
}
const env = require("./start/env");

// Validate environment configuration
const envValidation = SecureConfig.validateEnvironment();
if (!envValidation.isValid) {
	Logger.error('❌ Environment validation failed:');
	envValidation.issues.forEach(issue => Logger.error(`   - ${issue}`));
	process.exit(1);
}

if (envValidation.warnings.length > 0) {
	Logger.warn('⚠️  Environment warnings:');
	envValidation.warnings.forEach(warning => Logger.warn(`   - ${warning}`));
}

// Initialize Sentry (only in production)
const { initializeSentry, Sentry } = require("./start/sentry");
initializeSentry();

nunjucks.configure("views", { autoescape: true });

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", "loopback");

// Use enhanced helmet configuration for security headers
app.use(helmet(helmetConfig));

// Enhanced security headers
app.use(securityHeaders);

// Configure CORS using cached secure configuration for better performance
app.use(cors(SecureConfig.getCachedCORSConfig()));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Comprehensive input sanitization middleware
const { comprehensiveInputSanitization } = require('./app/middlewares/comprehensive-input-sanitization');
app.use(comprehensiveInputSanitization);

// Enhanced Session Security Configuration
app.use(cookieSession(SessionSecurity.getSessionConfig()));

// Session Security Middleware
app.use(SessionSecurity.middleware);

// Comprehensive Logging Middleware
app.use(loggingMiddleware);
app.use(securityLoggingMiddleware);

// CSRF Protection - Generate tokens for all requests
app.use(generateCsrfToken);

// Global Authentication - Set user/admin context for all requests
app.use(SessionSecurity.authenticateUser);
app.use(SessionSecurity.authenticateAdmin);

// Global Rate Limiting - Apply to all routes
// Apply burst protection to all routes
app.use(burstLimiter);

// Apply general API rate limiting
app.use(apiLimiter);

// VPS Plan subscription Reminder Service
require("./app/jobs/subscriptionReminder");
// cPanel License Reminder Service
require("./app/jobs/cPanelLicenseReminder");
// Auto Renew VPS Plan subscription
require("./app/jobs/autoRenewVPSSubscription");
// Auto Rnew cPanel License
require("./app/jobs/autoRenewcPanelLicense");

// RDP Subscription autoRenew
require("./app/jobs/rdpLifecycleJob");
// RDP Subscription reminder
require("./app/jobs/rdpSubscriptionReminder");
require("./app/jobs/deleteExpiredAccounts");
require("./app/models/User");
require("./app/models/Wallet");
require("./app/models/Transaction");
require("./app/models/APIKey");
require("./app/models/RewardPointLog");
require("./app/models/MembershipTier");
require("./app/models/Badge");
require("./start/logging")();
require("./routes")(app);

if (process.env.NODE_ENV !== "development") {
	app.use(express.static(path.join(__dirname, "client/dist")));
	app.get("*", (req, res) => {
		return res.sendFile(
			path.resolve(__dirname, "client", "dist", "index.html")
		);
	});
}

Sentry.setupExpressErrorHandler(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404, "Route not found"));
});

// CSRF Error handling
app.use(handleCsrfError);

// Error logging middleware
app.use(errorLoggingMiddleware);

app.use(errorHandler);

module.exports = app;
