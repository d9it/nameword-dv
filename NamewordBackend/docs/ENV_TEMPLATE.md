# Environment Template (.env)

Copy this template to create your `.env` file:

```env
# =============================================================================
# NamewordBackend Environment Configuration
# =============================================================================
# Copy this file to .env and fill in your actual values
# cp .env.example .env

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================

# Application name
APP_NAME=NamewordBackend

# Application secret key for sessions and encryption (32+ characters recommended)
APP_KEY=your-32-character-app-key-here

# Application port
PORT=8000

# Environment mode (development, test, production, staging)
NODE_ENV=development

# Backend application URL
APP_URL=http://localhost:8000

# Frontend application URL
FRONTEND_URL=http://localhost:3000

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

# MongoDB connection string
DB_URI=mongodb://localhost:27017/nameword

# =============================================================================
# JWT CONFIGURATION
# =============================================================================

# JWT secret key for token signing (32+ characters recommended)
JWT_KEY=your-32-character-jwt-key-here

# =============================================================================
# GOOGLE OAUTH CONFIGURATION
# =============================================================================

# Google OAuth client ID
GOOGLE_CLIENT_ID=your-google-client-id

# Google OAuth client secret
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google OAuth redirect URL
GOOGLE_REDIRECT_URL=http://localhost:8000/auth/google/callback

# Google Cloud project ID
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id

# Alternative Google Cloud project ID
GOOGLE_PROJECT_ID=your-google-cloud-project-id

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================

# Email driver (smtp, sendmail, mail)
MAIL_MAILER=smtp

# SMTP host
MAIL_HOST=smtp.gmail.com

# SMTP port
MAIL_PORT=587

# SMTP username (email address)
MAIL_USERNAME=your-email@gmail.com

# SMTP password (use app-specific password for Gmail)
MAIL_PASSWORD=your-app-specific-password

# SMTP encryption (tls, ssl, null)
MAIL_ENCRYPTION=tls

# Default from email address
MAIL_FROM_ADDRESS=hello@example.com

# Default from name
MAIL_FROM_NAME=Nameword Support

# =============================================================================
# TELEGRAM CONFIGURATION
# =============================================================================

# Telegram bot token (from @BotFather)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# =============================================================================
# ADMIN CONFIGURATION
# =============================================================================

# Admin registration token (16+ characters)
ADMIN_REGISTER_TOKEN=your-16-character-admin-token

# Admin email address
ADMIN_MAIL_ADDRESS=admin@nameword.com

# =============================================================================
# WHM (WEB HOST MANAGER) CONFIGURATION
# =============================================================================

# WHM username
WHM_USERNAME=root

# WHM password
WHM_PASSWORD=your-whm-password

# WHM API key
WHM_API_KEY=your-whm-api-key

# WHM server URL
WHM_SERVER_URL=https://your-whm-server.com:2087

# WHM cPanel URL
WHM_CPANEL_URL=https://your-whm-server.com:2083

# WHM primary nameserver
WHM_NS1=ns1.your-domain.com

# WHM secondary nameserver
WHM_NS2=ns2.your-domain.com

# WHM server IP address
WHM_SERVER_IP=192.168.1.1

# =============================================================================
# PLESK CONFIGURATION
# =============================================================================

# Plesk login username
PLESK_LOGIN=your-plesk-login

# Plesk password
PLESK_PASSWORD=your-plesk-password

# Plesk server URL
PLESK_SERVER_URL=https://your-plesk-server.com:8443

# Plesk panel URL
PLESK_PANEL_URL=https://your-plesk-server.com:8880

# Plesk primary nameserver
PLESK_NS1=ns1.your-domain.com

# Plesk secondary nameserver
PLESK_NS2=ns2.your-domain.com

# Plesk server IP address
PLESK_SERVER_IP=192.168.1.2

# =============================================================================
# CLOUDFLARE CONFIGURATION
# =============================================================================

# Cloudflare email
CLOUDFLARE_EMAIL=your-cloudflare-email

# Cloudflare API key
CLOUDFLARE_API_KEY=your-cloudflare-api-key

# =============================================================================
# TWILIO CONFIGURATION
# =============================================================================

# Twilio account SID (starts with AC)
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID

# Twilio auth token
TWILIO_AUTH_TOKEN=your-twilio-auth-token

# Twilio verify service SID
TWILIO_VERIFY_SID=your-twilio-verify-sid

# =============================================================================
# GOOGLE CLOUD STORAGE CONFIGURATION
# =============================================================================

# Google Cloud Storage bucket name
GCLOUD_STORAGE_BUCKET_NAME=your-bucket-name

# =============================================================================
# DOMAIN PROVIDER CONFIGURATION
# =============================================================================

# Connect Reseller customer ID
CR_CUSTOMER_ID=your-customer-id

# Connect Reseller API key
CONNECTSELLER_API_KEY=your-api-key

# =============================================================================
# UPCLOUD CONFIGURATION
# =============================================================================

# UpCloud username
UPCLOUD_USERNAME=your-upcloud-username

# UpCloud password
UPCLOUD_PASSWORD=your-upcloud-password

# =============================================================================
# SENTRY CONFIGURATION (OPTIONAL)
# =============================================================================

# Sentry DSN for error tracking (required in production)
SENTRY_DSN=

# Sentry environment
SENTRY_ENVIRONMENT=development

# Sentry traces sample rate (0.0 - 1.0)
SENTRY_TRACES_SAMPLE_RATE=0.1

# Sentry profiles sample rate (0.0 - 1.0)
SENTRY_PROFILES_SAMPLE_RATE=0.1

# =============================================================================
# CORS CONFIGURATION
# =============================================================================

# Comma-separated list of allowed CORS origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

# Content-Type report URI for CSP violations
CT_REPORT_URI=https://example.com/report

# =============================================================================
# VITE CONFIGURATION (CLIENT)
# =============================================================================

# Backend URL for Vite client
VITE_PUBLIC_BACKEND_URL=http://localhost:8000

# =============================================================================
# SECURITY NOTES
# =============================================================================
# 
# IMPORTANT SECURITY REQUIREMENTS:
# 
# 1. APP_KEY and JWT_KEY must be different
# 2. All keys should be at least 32 characters in production
# 3. Use strong, unique passwords for all services
# 4. Use app-specific passwords for email services
# 5. Never commit .env files to version control
# 6. Rotate keys regularly in production
# 7. Use environment-specific configurations
# 
# PRODUCTION REQUIREMENTS:
# 
# 1. NODE_ENV must be "production"
# 2. SENTRY_DSN must be set
# 3. MAIL_ENCRYPTION must be "tls"
# 4. All URLs must use HTTPS
# 5. Strong passwords and keys required
# 
# =============================================================================
```

## Setup Instructions

1. **Copy the template:**
   ```bash
   cp docs/ENV_TEMPLATE.md .env
   ```

2. **Edit the file:**
   ```bash
   nano .env
   ```

3. **Fill in your actual values** for all required variables

4. **Test the configuration:**
   ```bash
   node -e "require('./start/env.js')"
   ```

## Security Checklist

- [ ] APP_KEY is 32+ characters and different from JWT_KEY
- [ ] JWT_KEY is 32+ characters and different from APP_KEY
- [ ] ADMIN_REGISTER_TOKEN is 16+ characters
- [ ] All passwords are strong and unique
- [ ] All URLs use HTTPS in production
- [ ] Email uses app-specific passwords
- [ ] SENTRY_DSN is set for production
- [ ] MAIL_ENCRYPTION is "tls" in production 