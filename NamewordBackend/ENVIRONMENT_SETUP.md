# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

### Application Configuration
```
APP_NAME=NamewordBackend
APP_KEY=your-app-key-here
PORT=8000
NODE_ENV=development
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Database Configuration
```
DB_URI=mongodb://localhost:27017/nameword
```

### JWT Configuration
```
JWT_KEY=your-jwt-secret-key-here
```

### Google OAuth Configuration
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URL=http://localhost:8000/auth/google/callback
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id
```

### Email Configuration
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@nameword.com
MAIL_FROM_NAME=Nameword
```

### Telegram Bot Configuration
```
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

### Admin Configuration
```
ADMIN_REGISTER_TOKEN=your-admin-register-token
ADMIN_MAIL_ADDRESS=admin@nameword.com
```

### WHM Configuration
```
WHM_USERNAME=root
WHM_PASSWORD=your-whm-password
WHM_API_KEY=your-whm-api-key
WHM_SERVER_URL=https://your-whm-server.com:2087
WHM_CPANEL_URL=https://your-whm-server.com:2083
WHM_NS1=ns1.your-domain.com
WHM_NS2=ns2.your-domain.com
WHM_SERVER_IP=your-whm-server-ip
```

### Plesk Configuration
```
PLESK_LOGIN=your-plesk-login
PLESK_PASSWORD=your-plesk-password
PLESK_SERVER_URL=https://your-plesk-server.com:8443
PLESK_PANEL_URL=https://your-plesk-server.com:8880
PLESK_NS1=ns1.your-domain.com
PLESK_NS2=ns2.your-domain.com
PLESK_SERVER_IP=your-plesk-server-ip
```

### Cloudflare Configuration
```
CLOUDFLARE_EMAIL=your-cloudflare-email
CLOUDFLARE_API_KEY=your-cloudflare-api-key
```

### Twilio Configuration
```
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SID=your-twilio-verify-sid
```

### Google Cloud Storage
```
GCLOUD_STORAGE_BUCKET_NAME=your-bucket-name
```

### Connect Reseller Configuration
```
CR_CUSTOMER_ID=your-customer-id
CONNECTSELLER_API_KEY=your-api-key
```

### Sentry Configuration (Optional)
```
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
```

### CORS Configuration
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-domain.com
```

## Security Notes

1. **Never commit the `.env` file to version control**
2. **Use strong, unique passwords for all services**
3. **Rotate API keys and tokens regularly**
4. **Use environment-specific configurations for different deployments**
5. **Keep JWT keys and other secrets secure**

## Production Checklist

- [ ] All environment variables are set
- [ ] Database connection is secure
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Security headers are set
- [ ] Error logging is configured
- [ ] Monitoring is set up 