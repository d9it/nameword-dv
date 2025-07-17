const { cleanEnv, str, email, json, num, port, url, bool, host } = require("envalid");
const { Logger } = require('../app/utils/logger');

const env = cleanEnv(process.env, {
	// Application Configuration
	APP_NAME: str({ default: "NamewordBackend" }),
	APP_KEY: str({ desc: "Application secret key for sessions and encryption" }),
	PORT: port({ default: 8000 }),
	NODE_ENV: str({
		choices: ["development", "test", "production", "staging"],
		default: "development"
	}),
	APP_URL: url({ desc: "Backend application URL" }),
	FRONTEND_URL: url({ desc: "Frontend application URL" }),
	
	// Database Configuration
	DB_URI: str({ desc: "MongoDB connection string" }),
	
	// JWT Configuration
	JWT_KEY: str({ desc: "JWT secret key for token signing" }),
	
	// Google OAuth Configuration
	GOOGLE_CLIENT_ID: str({ desc: "Google OAuth client ID" }),
	GOOGLE_CLIENT_SECRET: str({ desc: "Google OAuth client secret" }),
	GOOGLE_REDIRECT_URL: url({ desc: "Google OAuth redirect URL" }),
	GOOGLE_CLOUD_PROJECT_ID: str({ desc: "Google Cloud project ID" }),
	GOOGLE_PROJECT_ID: str({ desc: "Google Cloud project ID (alternative)" }),
	
	// Email Configuration
	MAIL_MAILER: str({ choices: ["smtp", "sendmail", "mail"], default: "smtp" }),
	MAIL_HOST: str({ desc: "SMTP host" }),
	MAIL_PORT: port({ desc: "SMTP port" }),
	MAIL_USERNAME: str({ desc: "SMTP username" }),
	MAIL_PASSWORD: str({ desc: "SMTP password" }),
	MAIL_ENCRYPTION: str({ choices: ["tls", "ssl", null], default: "tls" }),
	MAIL_FROM_ADDRESS: email({ desc: "Default from email address" }),
	MAIL_FROM_NAME: str({ desc: "Default from name" }),
	
	// Telegram Configuration
	TELEGRAM_BOT_TOKEN: str({ desc: "Telegram bot token" }),
	
	// Admin Configuration
	ADMIN_REGISTER_TOKEN: str({ desc: "Admin registration token" }),
	ADMIN_MAIL_ADDRESS: email({ desc: "Admin email address" }),
	
	// WHM Configuration
	WHM_USERNAME: str({ default: "root", desc: "WHM username" }),
	WHM_PASSWORD: str({ desc: "WHM password" }),
	WHM_API_KEY: str({ desc: "WHM API key" }),
	WHM_SERVER_URL: url({ desc: "WHM server URL" }),
	WHM_CPANEL_URL: url({ desc: "WHM cPanel URL" }),
	WHM_NS1: str({ desc: "WHM primary nameserver" }),
	WHM_NS2: str({ desc: "WHM secondary nameserver" }),
	WHM_SERVER_IP: str({ desc: "WHM server IP address" }),
	
	// Plesk Configuration
	PLESK_LOGIN: str({ desc: "Plesk login username" }),
	PLESK_PASSWORD: str({ desc: "Plesk password" }),
	PLESK_SERVER_URL: str({ desc: "Plesk server URL" }),
	PLESK_PANEL_URL: str({ desc: "Plesk panel URL" }),
	PLESK_NS1: str({ desc: "Plesk primary nameserver" }),
	PLESK_NS2: str({ desc: "Plesk secondary nameserver" }),
	PLESK_SERVER_IP: str({ desc: "Plesk server IP address" }),
	
	// Cloudflare Configuration
	CLOUDFLARE_EMAIL: email({ desc: "Cloudflare email" }),
	CLOUDFLARE_API_KEY: str({ desc: "Cloudflare API key" }),
	
	// Twilio Configuration
	TWILIO_ACCOUNT_SID: str({ desc: "Twilio account SID" }),
	TWILIO_AUTH_TOKEN: str({ desc: "Twilio auth token" }),
	TWILIO_VERIFY_SID: str({ desc: "Twilio verify service SID" }),
	
	// Google Cloud Storage Configuration
	GCLOUD_STORAGE_BUCKET_NAME: str({ desc: "Google Cloud Storage bucket name" }),
	
	// Domain Provider Configuration
	CR_CUSTOMER_ID: str({ desc: "Connect Reseller customer ID" }),
	CONNECTSELLER_API_KEY: str({ desc: "Connect Reseller API key" }),
	
	// UpCloud Configuration
	UPCLOUD_USERNAME: str({ desc: "UpCloud username" }),
	UPCLOUD_PASSWORD: str({ desc: "UpCloud password" }),
	
	// Sentry Configuration (optional)
	SENTRY_DSN: str({ default: "", desc: "Sentry DSN for error tracking" }),
	SENTRY_ENVIRONMENT: str({ default: "development", desc: "Sentry environment" }),
	SENTRY_TRACES_SAMPLE_RATE: num({ default: 0.1, desc: "Sentry traces sample rate" }),
	SENTRY_PROFILES_SAMPLE_RATE: num({ default: 0.1, desc: "Sentry profiles sample rate" }),
	
	// CORS Configuration
	ALLOWED_ORIGINS: str({ 
		default: "http://localhost:3000,http://localhost:5173",
		desc: "Comma-separated list of allowed CORS origins"
	}),
	
	// Security Configuration
	CT_REPORT_URI: str({ 
		default: "https://example.com/report",
		desc: "Content-Type report URI for CSP violations"
	}),
	
	// Vite Configuration (for client)
	VITE_PUBLIC_BACKEND_URL: str({ 
		default: "http://localhost:8000",
		desc: "Backend URL for Vite client"
	}),
});

// Additional validation for environment-specific requirements
const validateEnvironment = () => {
	const errors = [];
	
	// Production environment validations
	if (env.NODE_ENV === "production") {
		if (!env.SENTRY_DSN) {
			errors.push("SENTRY_DSN is required in production for error tracking");
		}
		
		if (env.NODE_ENV === "production" && env.MAIL_ENCRYPTION !== "tls") {
			errors.push("MAIL_ENCRYPTION must be 'tls' in production");
		}
		
		if (!env.APP_KEY || env.APP_KEY.length < 32) {
			errors.push("APP_KEY must be at least 32 characters long in production");
		}
		
		if (!env.JWT_KEY || env.JWT_KEY.length < 32) {
			errors.push("JWT_KEY must be at least 32 characters long in production");
		}
	}
	
	// Development environment validations
	if (env.NODE_ENV === "development") {
		if (env.MAIL_FROM_ADDRESS === "hello@example.com") {
			Logger.warn("⚠️  Using default MAIL_FROM_ADDRESS in development");
		}
	}
	
	// Security validations for all environments
	if (env.APP_KEY === env.JWT_KEY) {
		errors.push("APP_KEY and JWT_KEY must be different for security");
	}
	
	if (env.ADMIN_REGISTER_TOKEN && env.ADMIN_REGISTER_TOKEN.length < 16) {
		errors.push("ADMIN_REGISTER_TOKEN must be at least 16 characters long");
	}
	
	// URL format validations
	try {
		new URL(env.APP_URL);
		new URL(env.FRONTEND_URL);
	} catch (error) {
		errors.push("Invalid URL format in APP_URL or FRONTEND_URL");
	}
	
	// Email format validations
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(env.MAIL_FROM_ADDRESS)) {
		errors.push("Invalid MAIL_FROM_ADDRESS format");
	}
	
	if (!emailRegex.test(env.ADMIN_MAIL_ADDRESS)) {
		errors.push("Invalid ADMIN_MAIL_ADDRESS format");
	}
	
	// Database URI validation
	if (!env.DB_URI.startsWith("mongodb://") && !env.DB_URI.startsWith("mongodb+srv://")) {
		errors.push("DB_URI must be a valid MongoDB connection string");
	}
	
	// JWT key strength validation
	if (env.JWT_KEY.length < 16) {
		errors.push("JWT_KEY must be at least 16 characters long");
	}
	
	// Telegram token validation
	if (env.TELEGRAM_BOT_TOKEN && !env.TELEGRAM_BOT_TOKEN.includes(":")) {
		errors.push("Invalid TELEGRAM_BOT_TOKEN format");
	}
	
	// Twilio SID validation
	if (env.TWILIO_ACCOUNT_SID && !env.TWILIO_ACCOUNT_SID.startsWith("AC")) {
		errors.push("Invalid TWILIO_ACCOUNT_SID format");
	}
	
	// Google Cloud project validation
	if (env.GOOGLE_CLOUD_PROJECT_ID && env.GOOGLE_CLOUD_PROJECT_ID.includes(" ")) {
		errors.push("GOOGLE_CLOUD_PROJECT_ID cannot contain spaces");
	}
	
	// WHM configuration validation
	if (env.WHM_SERVER_URL && !env.WHM_SERVER_URL.includes(":2087")) {
		Logger.warn("⚠️  WHM_SERVER_URL should typically use port 2087");
	}
	
	if (env.WHM_CPANEL_URL && !env.WHM_CPANEL_URL.includes(":2083")) {
		Logger.warn("⚠️  WHM_CPANEL_URL should typically use port 2083");
	}
	
	// Plesk configuration validation
	if (env.PLESK_SERVER_URL && !env.PLESK_SERVER_URL.includes(":8443")) {
		Logger.warn("⚠️  PLESK_SERVER_URL should typically use port 8443");
	}
	
	if (env.PLESK_PANEL_URL && !env.PLESK_PANEL_URL.includes(":8880")) {
		Logger.warn("⚠️  PLESK_PANEL_URL should typically use port 8880");
	}
	
	// CORS origins validation
	const origins = env.ALLOWED_ORIGINS.split(",");
	for (const origin of origins) {
		try {
			new URL(origin.trim());
		} catch (error) {
			errors.push(`Invalid CORS origin: ${origin}`);
		}
	}
	
	// Return validation results
	if (errors.length > 0) {
		Logger.error("❌ Environment validation failed:");
		errors.forEach(error => Logger.error(`   - ${error}`));
		throw new Error("Environment validation failed. Please check the errors above.");
	}
	
	Logger.info("✅ Environment validation passed");
	return true;
};

// Validate environment on module load
validateEnvironment();

// Export validated environment
module.exports = env;
