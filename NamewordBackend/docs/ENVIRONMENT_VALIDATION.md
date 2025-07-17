# Environment Variable Validation

## Overview

This document describes the comprehensive environment variable validation system implemented to ensure all required environment variables are properly configured before the application starts.

## 🔍 Problem Solved

### Before Implementation
- **Missing Environment Variables**: Application would start with missing critical variables
- **Runtime Errors**: Failures would occur at runtime when variables were accessed
- **Security Issues**: Weak or missing security keys could be used
- **Configuration Errors**: Invalid formats for URLs, emails, etc.
- **No Validation**: No checks for required vs optional variables

### After Implementation
- **Early Detection**: All validation happens at startup
- **Comprehensive Checks**: Validates format, length, and security requirements
- **Clear Error Messages**: Specific guidance on what needs to be fixed
- **Security Validation**: Ensures proper key strength and uniqueness
- **Environment-Specific Rules**: Different requirements for dev/prod

## 🛠️ Implementation

### Core Validation System

**File**: `start/env.js`

```javascript
const { cleanEnv, str, email, json, num, port, url, bool, host } = require("envalid");

const env = cleanEnv(process.env, {
    // Application Configuration
    APP_NAME: str({ default: "NamewordBackend" }),
    APP_KEY: str({ desc: "Application secret key for sessions and encryption" }),
    PORT: port({ default: 8000 }),
    NODE_ENV: str({
        choices: ["development", "test", "production", "staging"],
        default: "development"
    }),
    // ... comprehensive validation for all variables
});
```

### Validation Features

#### 1. **Type Validation**
- **String**: Basic string validation
- **Email**: Valid email format
- **URL**: Valid URL format
- **Port**: Valid port number (1-65535)
- **Number**: Numeric values with ranges
- **Boolean**: True/false values

#### 2. **Format Validation**
```javascript
// URL format validation
APP_URL: url({ desc: "Backend application URL" }),

// Email format validation
MAIL_FROM_ADDRESS: email({ desc: "Default from email address" }),

// Port range validation
PORT: port({ default: 8000 }),
```

#### 3. **Security Validation**
```javascript
// Production requirements
if (env.NODE_ENV === "production") {
    if (!env.SENTRY_DSN) {
        errors.push("SENTRY_DSN is required in production for error tracking");
    }
    
    if (env.APP_KEY.length < 32) {
        errors.push("APP_KEY must be at least 32 characters long in production");
    }
}

// Security key validation
if (env.APP_KEY === env.JWT_KEY) {
    errors.push("APP_KEY and JWT_KEY must be different for security");
}
```

#### 4. **Custom Validation Rules**
```javascript
// Telegram token validation
if (env.TELEGRAM_BOT_TOKEN && !env.TELEGRAM_BOT_TOKEN.includes(":")) {
    errors.push("Invalid TELEGRAM_BOT_TOKEN format");
}

// Twilio SID validation
if (env.TWILIO_ACCOUNT_SID && !env.TWILIO_ACCOUNT_SID.startsWith("AC")) {
    errors.push("Invalid TWILIO_ACCOUNT_SID format");
}
```

## 📋 Validation Rules

### Required Variables (All Environments)
- `APP_KEY` - Application secret key
- `JWT_KEY` - JWT signing key
- `DB_URI` - MongoDB connection string
- `APP_URL` - Backend URL
- `FRONTEND_URL` - Frontend URL
- `MAIL_HOST` - SMTP host
- `MAIL_USERNAME` - SMTP username
- `MAIL_PASSWORD` - SMTP password
- `ADMIN_MAIL_ADDRESS` - Admin email
- `ADMIN_REGISTER_TOKEN` - Admin registration token

### Production Requirements
- `SENTRY_DSN` - Error tracking (required)
- `MAIL_ENCRYPTION` - Must be "tls"
- `APP_KEY` - Minimum 32 characters
- `JWT_KEY` - Minimum 32 characters
- All URLs must use HTTPS

### Security Requirements
- `APP_KEY` and `JWT_KEY` must be different
- `ADMIN_REGISTER_TOKEN` minimum 16 characters
- All email addresses must be valid format
- All URLs must be valid format
- Database URI must be valid MongoDB connection string

### Format Validations
- **Telegram Token**: Must contain ":"
- **Twilio SID**: Must start with "AC"
- **Google Project ID**: Cannot contain spaces
- **CORS Origins**: Must be valid URLs
- **Port Numbers**: Must be 1-65535

## 🚀 Usage

### Manual Validation
```bash
# Validate environment variables
npm run validate-env

# Or directly
node scripts/validate-env.js
```

### Automatic Validation
```bash
# Environment validation runs automatically before start
npm start
```

### Development Setup
```bash
# 1. Copy environment template
cp docs/ENV_TEMPLATE.md .env

# 2. Edit with your values
nano .env

# 3. Validate
npm run validate-env

# 4. Start application
npm start
```

## 📊 Validation Output

### Success Example
```
🔍 Validating environment variables...

✅ Environment validation passed!
📋 Environment Summary:
   - Environment: development
   - Port: 8000
   - App URL: http://localhost:8000
   - Frontend URL: http://localhost:3000
   - Database: Configured
   - JWT: Configured
   - Email: Configured
   - Telegram: Configured
   - Sentry: Not configured

🚀 Environment is ready! You can start the application.
```

### Error Example
```
❌ Environment validation failed!

📝 To fix this:
1. Copy the environment template:
   cp docs/ENV_TEMPLATE.md .env

2. Edit the .env file with your actual values:
   nano .env

3. Run this validation script again:
   node scripts/validate-env.js

📚 For detailed documentation, see:
   docs/ENVIRONMENT_VARIABLES.md

🔐 Critical variables that must be set:
   - APP_KEY (32+ characters)
   - JWT_KEY (32+ characters)
   - DB_URI (MongoDB connection string)
   - APP_URL (Backend URL)
   - FRONTEND_URL (Frontend URL)
   - MAIL_HOST (SMTP host)
   - MAIL_USERNAME (SMTP username)
   - MAIL_PASSWORD (SMTP password)
   - ADMIN_MAIL_ADDRESS (Admin email)
   - ADMIN_REGISTER_TOKEN (16+ characters)
```

## 🔧 Configuration

### Adding New Variables

1. **Add to validation schema** in `start/env.js`:
```javascript
NEW_VARIABLE: str({ desc: "Description of the variable" }),
```

2. **Add validation rules** if needed:
```javascript
// Custom validation
if (env.NEW_VARIABLE && !isValidFormat(env.NEW_VARIABLE)) {
    errors.push("Invalid NEW_VARIABLE format");
}
```

3. **Update documentation** in `docs/ENVIRONMENT_VARIABLES.md`

### Environment-Specific Rules

```javascript
// Development-specific validations
if (env.NODE_ENV === "development") {
    if (env.MAIL_FROM_ADDRESS === "hello@example.com") {
        console.warn("⚠️  Using default MAIL_FROM_ADDRESS in development");
    }
}

// Production-specific validations
if (env.NODE_ENV === "production") {
    if (!env.SENTRY_DSN) {
        errors.push("SENTRY_DSN is required in production");
    }
}
```

## 🛡️ Security Benefits

### 1. **Prevents Runtime Errors**
- Catches missing variables before application starts
- Validates format requirements early
- Ensures all required services are configured

### 2. **Enforces Security Standards**
- Ensures proper key lengths
- Validates unique keys for different purposes
- Enforces production security requirements

### 3. **Improves Configuration Management**
- Clear documentation of all variables
- Environment-specific requirements
- Helpful error messages and guidance

### 4. **Reduces Deployment Issues**
- Prevents deployment with missing configuration
- Validates production requirements
- Ensures consistent configuration across environments

## 📚 Related Documentation

- [Environment Variables Documentation](ENVIRONMENT_VARIABLES.md)
- [Environment Template](ENV_TEMPLATE.md)
- [Security Headers](SECURITY_HEADERS.md)
- [Critical Bugs Fixed](CRITICAL_BUGS_FIXED.md)

## 🔍 Troubleshooting

### Common Issues

1. **Missing Required Variables**
   - Set all required variables in `.env` file
   - Use the template as a starting point

2. **Invalid Formats**
   - Check URL format requirements
   - Verify email address formats
   - Ensure proper port numbers

3. **Security Issues**
   - Use different keys for APP_KEY and JWT_KEY
   - Ensure minimum character requirements
   - Use strong passwords

4. **Production Requirements**
   - Set SENTRY_DSN for error tracking
   - Use TLS encryption for email
   - Use HTTPS URLs

### Validation Script

The validation script provides:
- Clear error messages
- Step-by-step guidance
- Links to documentation
- Security checklist

## ✅ Best Practices

1. **Always validate before deployment**
2. **Use different keys for different purposes**
3. **Follow environment-specific requirements**
4. **Keep documentation updated**
5. **Test validation with different configurations**
6. **Monitor for new variable requirements** 