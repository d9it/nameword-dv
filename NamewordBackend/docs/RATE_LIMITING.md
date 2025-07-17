# Rate Limiting Implementation

## Overview

This application now includes comprehensive rate limiting to protect against brute force attacks, DDoS, and abuse. Rate limiting is implemented using the `express-rate-limit` package with different limits for different types of operations.

## Implementation Details

### 1. Rate Limiter Middleware (`app/middlewares/rate-limiter.js`)

The application uses four different rate limiters:

#### **Global API Limiter**
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Applied**: Globally to all routes
- **Purpose**: Basic protection against general abuse

#### **Authentication Limiter**
- **Window**: 15 minutes
- **Limit**: 5 requests per IP
- **Applied**: Login, register, password reset, verification routes
- **Purpose**: Prevent brute force attacks on authentication

#### **Sensitive Operations Limiter**
- **Window**: 1 hour
- **Limit**: 10 requests per IP
- **Applied**: Account deletion, wallet operations, payment processing
- **Purpose**: Protect critical operations from abuse

#### **File Upload Limiter**
- **Window**: 1 hour
- **Limit**: 20 uploads per IP
- **Applied**: Profile picture uploads, file uploads
- **Purpose**: Prevent storage abuse and bandwidth attacks

### 2. Integration Points

#### **Global Application Level** (`app.js`)
```javascript
// Global Rate Limiting - Apply to all routes
app.use(apiLimiter);
```

#### **Authentication Routes** (`routes/api/auth.js`)
- Login: `authLimiter` (5 attempts per 15 minutes)
- Register: `authLimiter` + `uploadLimiter`
- Password Reset: `authLimiter`
- Email Verification: `authLimiter`
- Mobile OTP: `authLimiter`
- Account Deactivation: `sensitiveLimiter`
- Account Deletion: `sensitiveLimiter`

#### **Wallet Routes** (`routes/api/wallet.js`)
- Create Wallet: `sensitiveLimiter`
- Fund Wallet: `sensitiveLimiter`
- Process Payment: `sensitiveLimiter`

### 3. Rate Limiting Headers

The rate limiters include standard headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: Time when limit resets
- `Retry-After`: Time to wait before retrying

### 4. Error Responses

When rate limits are exceeded, the application returns:
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

## Security Benefits

### **Before Implementation:**
- ❌ No protection against brute force attacks
- ❌ Vulnerable to DDoS attacks
- ❌ No limits on sensitive operations
- ❌ Storage abuse possible

### **After Implementation:**
- ✅ Brute force protection on authentication
- ✅ DDoS protection with global limits
- ✅ Sensitive operations protected
- ✅ File upload abuse prevented
- ✅ Clear error messages with retry guidance

## Configuration

Rate limits can be adjusted in `app/middlewares/rate-limiter.js`:

```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});
```

## Monitoring

The rate limiting implementation includes:
- Standard rate limit headers for monitoring
- Clear error messages for users
- Different limits for different operation types
- Automatic cleanup of expired entries

## Best Practices

1. **Gradual Implementation**: Start with conservative limits
2. **Monitor Usage**: Track rate limit hits to adjust limits
3. **User Communication**: Clear error messages with retry guidance
4. **Different Limits**: Sensitive operations have stricter limits
5. **Global Protection**: All routes have basic protection

## Testing

To test rate limiting:
1. Make multiple rapid requests to a protected endpoint
2. Check for rate limit headers in response
3. Verify error message when limit exceeded
4. Wait for window to reset and retry

## Future Enhancements

- **IP Whitelisting**: Allow certain IPs to bypass limits
- **User-based Limits**: Different limits for authenticated users
- **Dynamic Limits**: Adjust limits based on user behavior
- **Rate Limit Analytics**: Track and analyze rate limit usage 