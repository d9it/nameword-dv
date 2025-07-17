# Environment Variables Documentation

## Overview

This document provides comprehensive documentation for all environment variables used in the NamewordBackend application, including validation rules, security considerations, and setup instructions.

## 🔐 Security Critical Variables

### Application Security
- **APP_KEY**: Application secret key for sessions and encryption
  - **Required**: Yes
  - **Min Length**: 32 characters (production)
  - **Format**: Random string
  - **Security**: Must be different from JWT_KEY

- **JWT_KEY**: JWT secret key for token signing
  - **Required**: Yes
  - **Min Length**: 32 characters (production)
  - **Format**: Random string
  - **Security**: Must be different from APP_KEY

- **ADMIN_REGISTER_TOKEN**: Admin registration token
  - **Required**: Yes
  - **Min Length**: 16 characters
  - **Format**: Random string
  - **Security**: Used for admin account creation

## 🌐 Application Configuration

### Basic Configuration
- **APP_NAME**: Application name
  - **Default**: "NamewordBackend"
  - **Required**: No

- **PORT**: Application port
  - **Default**: 8000
  - **Required**: No
  - **Range**: 1-65535

- **NODE_ENV**: Environment mode
  - **Choices**: "development", "test", "production", "staging"
  - **Default**: "development"
  - **Required**: No

- **APP_URL**: Backend application URL
  - **Required**: Yes
  - **Format**: Valid URL (http/https)

- **FRONTEND_URL**: Frontend application URL
  - **Required**: Yes
  - **Format**: Valid URL (http/https)

### CORS Configuration
- **ALLOWED_ORIGINS**: Comma-separated list of allowed CORS origins
  - **Default**: "http://localhost:3000,http://localhost:5173"
  - **Format**: Valid URLs separated by commas

## 🗄️ Database Configuration

- **DB_URI**: MongoDB connection string
  - **Required**: Yes
  - **Format**: mongodb:// or mongodb+srv://
  - **Example**: mongodb://localhost:27017/nameword

## 🔑 Authentication & OAuth

### Google OAuth
- **GOOGLE_CLIENT_ID**: Google OAuth client ID
  - **Required**: Yes
  - **Format**: Google OAuth client ID

- **GOOGLE_CLIENT_SECRET**: Google OAuth client secret
  - **Required**: Yes
  - **Format**: Google OAuth client secret

- **GOOGLE_REDIRECT_URL**: Google OAuth redirect URL
  - **Required**: Yes
  - **Format**: Valid URL

### Google Cloud
- **GOOGLE_CLOUD_PROJECT_ID**: Google Cloud project ID
  - **Required**: Yes
  - **Format**: Project ID (no spaces)

- **GOOGLE_PROJECT_ID**: Alternative Google Cloud project ID
  - **Required**: No
  - **Format**: Project ID (no spaces)

## 📧 Email Configuration

### SMTP Settings
- **MAIL_MAILER**: Email driver
  - **Choices**: "smtp", "sendmail", "mail"
  - **Default**: "smtp"
  - **Required**: No

- **MAIL_HOST**: SMTP host
  - **Required**: Yes
  - **Example**: smtp.gmail.com

- **MAIL_PORT**: SMTP port
  - **Required**: Yes
  - **Range**: 1-65535
  - **Common**: 587 (TLS), 465 (SSL)

- **MAIL_USERNAME**: SMTP username
  - **Required**: Yes
  - **Format**: Email address

- **MAIL_PASSWORD**: SMTP password
  - **Required**: Yes
  - **Security**: Use app-specific password

- **MAIL_ENCRYPTION**: SMTP encryption
  - **Choices**: "tls", "ssl", null
  - **Default**: "tls"
  - **Production**: Must be "tls"

### Email Identity
- **MAIL_FROM_ADDRESS**: Default from email address
  - **Required**: Yes
  - **Format**: Valid email address
  - **Default**: "hello@example.com"

- **MAIL_FROM_NAME**: Default from name
  - **Required**: Yes
  - **Example**: "Nameword Support"

## 🤖 Telegram Configuration

- **TELEGRAM_BOT_TOKEN**: Telegram bot token
  - **Required**: Yes
  - **Format**: Bot token from @BotFather
  - **Validation**: Must contain ":"

## 👨‍💼 Admin Configuration

- **ADMIN_MAIL_ADDRESS**: Admin email address
  - **Required**: Yes
  - **Format**: Valid email address
  - **Example**: "admin@nameword.com"

## 🖥️ WHM (Web Host Manager) Configuration

### WHM Server Settings
- **WHM_USERNAME**: WHM username
  - **Default**: "root"
  - **Required**: No

- **WHM_PASSWORD**: WHM password
  - **Required**: Yes
  - **Security**: Use strong password

- **WHM_API_KEY**: WHM API key
  - **Required**: Yes
  - **Format**: WHM API key

- **WHM_SERVER_URL**: WHM server URL
  - **Required**: Yes
  - **Format**: Valid URL
  - **Recommended Port**: 2087

- **WHM_CPANEL_URL**: WHM cPanel URL
  - **Required**: Yes
  - **Format**: Valid URL
  - **Recommended Port**: 2083

### WHM DNS Settings
- **WHM_NS1**: WHM primary nameserver
  - **Required**: Yes
  - **Format**: Domain name

- **WHM_NS2**: WHM secondary nameserver
  - **Required**: Yes
  - **Format**: Domain name

- **WHM_SERVER_IP**: WHM server IP address
  - **Required**: Yes
  - **Format**: Valid IP address

## 🖥️ Plesk Configuration

### Plesk Server Settings
- **PLESK_LOGIN**: Plesk login username
  - **Required**: Yes
  - **Format**: Username

- **PLESK_PASSWORD**: Plesk password
  - **Required**: Yes
  - **Security**: Use strong password

- **PLESK_SERVER_URL**: Plesk server URL
  - **Required**: Yes
  - **Format**: Valid URL
  - **Recommended Port**: 8443

- **PLESK_PANEL_URL**: Plesk panel URL
  - **Required**: Yes
  - **Format**: Valid URL
  - **Recommended Port**: 8880

### Plesk DNS Settings
- **PLESK_NS1**: Plesk primary nameserver
  - **Required**: Yes
  - **Format**: Domain name

- **PLESK_NS2**: Plesk secondary nameserver
  - **Required**: Yes
  - **Format**: Domain name

- **PLESK_SERVER_IP**: Plesk server IP address
  - **Required**: Yes
  - **Format**: Valid IP address

## ☁️ Cloudflare Configuration

- **CLOUDFLARE_EMAIL**: Cloudflare email
  - **Required**: Yes
  - **Format**: Valid email address

- **CLOUDFLARE_API_KEY**: Cloudflare API key
  - **Required**: Yes
  - **Format**: Cloudflare API key

## 📞 Twilio Configuration

- **TWILIO_ACCOUNT_SID**: Twilio account SID
  - **Required**: Yes
  - **Format**: Starts with "AC"

- **TWILIO_AUTH_TOKEN**: Twilio auth token
  - **Required**: Yes
  - **Format**: Twilio auth token

- **TWILIO_VERIFY_SID**: Twilio verify service SID
  - **Required**: Yes
  - **Format**: Twilio verify service SID

## ☁️ Google Cloud Storage

- **GCLOUD_STORAGE_BUCKET_NAME**: Google Cloud Storage bucket name
  - **Required**: Yes
  - **Format**: Bucket name

## 🌐 Domain Provider Configuration

- **CR_CUSTOMER_ID**: Connect Reseller customer ID
  - **Required**: Yes
  - **Format**: Customer ID

- **CONNECTSELLER_API_KEY**: Connect Reseller API key
  - **Required**: Yes
  - **Format**: API key

## ☁️ UpCloud Configuration

- **UPCLOUD_USERNAME**: UpCloud username
  - **Required**: Yes
  - **Format**: Username

- **UPCLOUD_PASSWORD**: UpCloud password
  - **Required**: Yes
  - **Security**: Use strong password

## 📊 Sentry Configuration (Optional)

- **SENTRY_DSN**: Sentry DSN for error tracking
  - **Required**: Yes (production)
  - **Default**: ""
  - **Format**: Sentry DSN

- **SENTRY_ENVIRONMENT**: Sentry environment
  - **Default**: "development"
  - **Required**: No

- **SENTRY_TRACES_SAMPLE_RATE**: Sentry traces sample rate
  - **Default**: 0.1
  - **Range**: 0.0 - 1.0

- **SENTRY_PROFILES_SAMPLE_RATE**: Sentry profiles sample rate
  - **Default**: 0.1
  - **Range**: 0.0 - 1.0

## 🛡️ Security Configuration

- **CT_REPORT_URI**: Content-Type report URI for CSP violations
  - **Default**: "https://example.com/report"
  - **Format**: Valid URL

## 🚀 Vite Configuration (Client)

- **VITE_PUBLIC_BACKEND_URL**: Backend URL for Vite client
  - **Default**: "http://localhost:8000"
  - **Format**: Valid URL

## 🔧 Environment Setup

### Development Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file
nano .env
```

### Production Environment
```bash
# Set all required variables
export APP_KEY="your-32-character-app-key"
export JWT_KEY="your-32-character-jwt-key"
export DB_URI="mongodb://localhost:27017/nameword"
# ... set all other required variables
```

## ✅ Validation Rules

### Production Requirements
1. **SENTRY_DSN** must be set
2. **MAIL_ENCRYPTION** must be "tls"
3. **APP_KEY** must be at least 32 characters
4. **JWT_KEY** must be at least 32 characters

### Security Requirements
1. **APP_KEY** and **JWT_KEY** must be different
2. **ADMIN_REGISTER_TOKEN** must be at least 16 characters
3. All URLs must be valid
4. All email addresses must be valid
5. **DB_URI** must be a valid MongoDB connection string

### Format Validations
1. **TELEGRAM_BOT_TOKEN** must contain ":"
2. **TWILIO_ACCOUNT_SID** must start with "AC"
3. **GOOGLE_CLOUD_PROJECT_ID** cannot contain spaces
4. **CORS origins** must be valid URLs

## 🚨 Common Issues

### Missing Required Variables
```
❌ Environment validation failed:
   - APP_KEY is required
   - JWT_KEY is required
   - DB_URI is required
```

### Invalid Formats
```
❌ Environment validation failed:
   - Invalid MAIL_FROM_ADDRESS format
   - Invalid TELEGRAM_BOT_TOKEN format
   - Invalid TWILIO_ACCOUNT_SID format
```

### Security Issues
```
❌ Environment validation failed:
   - APP_KEY and JWT_KEY must be different for security
   - JWT_KEY must be at least 16 characters long
```

## 📝 Environment Template

Create a `.env.example` file with this template:

```env
# Application Configuration
APP_NAME=NamewordBackend
APP_KEY=your-32-character-app-key-here
PORT=8000
NODE_ENV=development
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_URI=mongodb://localhost:27017/nameword

# JWT Configuration
JWT_KEY=your-32-character-jwt-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URL=http://localhost:8000/auth/google/callback
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=hello@example.com
MAIL_FROM_NAME=Nameword Support

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Admin Configuration
ADMIN_REGISTER_TOKEN=your-16-character-admin-token
ADMIN_MAIL_ADDRESS=admin@nameword.com

# WHM Configuration
WHM_USERNAME=root
WHM_PASSWORD=your-whm-password
WHM_API_KEY=your-whm-api-key
WHM_SERVER_URL=https://your-whm-server.com:2087
WHM_CPANEL_URL=https://your-whm-server.com:2083
WHM_NS1=ns1.your-domain.com
WHM_NS2=ns2.your-domain.com
WHM_SERVER_IP=192.168.1.1

# Plesk Configuration
PLESK_LOGIN=your-plesk-login
PLESK_PASSWORD=your-plesk-password
PLESK_SERVER_URL=https://your-plesk-server.com:8443
PLESK_PANEL_URL=https://your-plesk-server.com:8880
PLESK_NS1=ns1.your-domain.com
PLESK_NS2=ns2.your-domain.com
PLESK_SERVER_IP=192.168.1.2

# Cloudflare Configuration
CLOUDFLARE_EMAIL=your-cloudflare-email
CLOUDFLARE_API_KEY=your-cloudflare-api-key

# Twilio Configuration
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SID=your-twilio-verify-sid

# Google Cloud Storage Configuration
GCLOUD_STORAGE_BUCKET_NAME=your-bucket-name

# Domain Provider Configuration
CR_CUSTOMER_ID=your-customer-id
CONNECTSELLER_API_KEY=your-api-key

# UpCloud Configuration
UPCLOUD_USERNAME=your-upcloud-username
UPCLOUD_PASSWORD=your-upcloud-password

# Sentry Configuration (Optional)
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Security Configuration
CT_REPORT_URI=https://example.com/report

# Vite Configuration (Client)
VITE_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 🔍 Troubleshooting

### Environment Validation Errors
1. Check all required variables are set
2. Verify format requirements (URLs, emails, etc.)
3. Ensure security requirements are met
4. Check for typos in variable names

### Common Solutions
1. **Missing variables**: Set all required environment variables
2. **Invalid formats**: Check URL/email format requirements
3. **Security issues**: Use different keys for APP_KEY and JWT_KEY
4. **Length issues**: Ensure minimum character requirements are met

## 📚 Additional Resources

- [Environment Variables Best Practices](https://12factor.net/config)
- [Node.js Environment Variables](https://nodejs.org/api/process.html#processenv)
- [Security Best Practices](https://owasp.org/www-project-top-ten/) 