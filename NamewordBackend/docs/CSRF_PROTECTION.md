# CSRF Protection Implementation

## Overview

This application now includes comprehensive Cross-Site Request Forgery (CSRF) protection using the `csrf-csrf` package. CSRF protection prevents malicious websites from making unauthorized requests on behalf of authenticated users.

## Implementation Details

### 1. CSRF Middleware (`app/middlewares/csrf.js`)

The CSRF protection is implemented with the following features:

- **Double Submit Cookie Pattern**: Uses both a cookie and a token for enhanced security
- **Automatic Token Generation**: Tokens are generated for all requests
- **Flexible Token Retrieval**: Supports multiple ways to send CSRF tokens:
  - Headers: `X-CSRF-Token` or `X-XSRF-Token`
  - Request body: `_csrf` field
  - Query parameters: `_csrf` parameter

### 2. Configuration

```javascript
const csrfProtection = doubleCsrf({
    secret: process.env.APP_KEY,
    cookieName: 'X-CSRF-Token',
    cookieOptions: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        signed: true
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS']
});
```

### 3. Protected Routes

CSRF protection is automatically applied to all state-changing operations (POST, PUT, DELETE, PATCH) except for:

- Authentication routes (login, register, password reset)
- Webhook endpoints
- Telegram bot endpoints
- GET requests

### 4. API Endpoints

#### Get CSRF Token
```
GET /api/auth/csrf-token
```

Response:
```json
{
    "success": true,
    "message": "CSRF token generated successfully",
    "data": {
        "token": "generated-token-here",
        "expiresIn": "24 hours"
    }
}
```

#### Validate CSRF Token
```
POST /api/auth/validate-csrf
```

Request:
```json
{
    "token": "your-csrf-token"
}
```

## Frontend Integration

### 1. Getting CSRF Tokens

```javascript
// Fetch CSRF token from server
const response = await fetch('/api/auth/csrf-token', {
    credentials: 'include'
});
const data = await response.json();
const csrfToken = data.data.token;
```

### 2. Including CSRF Tokens in Requests

#### Method 1: Headers (Recommended)
```javascript
fetch('/api/some-endpoint', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify(data)
});
```

#### Method 2: Request Body
```javascript
fetch('/api/some-endpoint', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
        ...data,
        _csrf: csrfToken
    })
});
```

#### Method 3: Query Parameters
```javascript
fetch(`/api/some-endpoint?_csrf=${csrfToken}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
});
```

### 3. Axios Configuration

```javascript
import axios from 'axios';

// Create axios instance with CSRF support
const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Request interceptor to add CSRF token
api.interceptors.request.use(async (config) => {
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
        try {
            const response = await axios.get('/api/auth/csrf-token', {
                withCredentials: true
            });
            config.headers['X-CSRF-Token'] = response.data.data.token;
        } catch (error) {
            console.error('Failed to get CSRF token:', error);
        }
    }
    return config;
});

export default api;
```

## Error Handling

### CSRF Token Errors

When a CSRF token is invalid or missing, the server returns:

```json
{
    "success": false,
    "message": "Invalid CSRF token. Please refresh the page and try again.",
    "error": "CSRF_ERROR"
}
```

### Handling CSRF Errors in Frontend

```javascript
try {
    const response = await fetch('/api/some-endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    
    if (response.status === 403) {
        const error = await response.json();
        if (error.error === 'CSRF_ERROR') {
            // Refresh the page or get a new CSRF token
            window.location.reload();
        }
    }
} catch (error) {
    console.error('Request failed:', error);
}
```

## Security Considerations

### 1. Token Expiration
- CSRF tokens expire with the session (24 hours)
- Tokens are automatically regenerated for each request

### 2. Cookie Security
- CSRF cookies are `httpOnly` and `secure` in production
- `sameSite: 'strict'` prevents cross-site attacks

### 3. Token Storage
- Never store CSRF tokens in localStorage
- Use memory storage or secure session storage
- Tokens should be refreshed regularly

### 4. HTTPS Requirement
- In production, all requests must use HTTPS
- CSRF cookies are only sent over secure connections

## Testing CSRF Protection

### 1. Valid Request
```bash
curl -X POST http://localhost:8000/api/some-endpoint \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: valid-token" \
  -H "Cookie: X-CSRF-Token=valid-token" \
  -d '{"data": "test"}'
```

### 2. Invalid Request (Should Fail)
```bash
curl -X POST http://localhost:8000/api/some-endpoint \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: invalid-token" \
  -d '{"data": "test"}'
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS is properly configured to allow CSRF headers
2. **Cookie Issues**: Check that cookies are being sent with requests
3. **Token Mismatch**: Ensure the same token is used in both cookie and header/body
4. **Session Issues**: Verify that sessions are working correctly

### Debug Mode

To debug CSRF issues, check the server logs for:
- CSRF token generation errors
- Token validation failures
- Cookie parsing issues

## Migration Guide

### For Existing Applications

1. **Update Frontend**: Add CSRF token handling to all state-changing requests
2. **Test Thoroughly**: Verify all forms and API calls work with CSRF protection
3. **Monitor Errors**: Watch for CSRF-related errors in production
4. **Update Documentation**: Inform users about CSRF token requirements

### Backward Compatibility

- GET requests are not affected
- Authentication endpoints are excluded
- Webhook endpoints are excluded
- Existing API structure remains unchanged

## Best Practices

1. **Always include CSRF tokens** in state-changing requests
2. **Refresh tokens** when sessions are renewed
3. **Handle CSRF errors** gracefully in the frontend
4. **Monitor for CSRF attacks** in production logs
5. **Regular security audits** of CSRF implementation 