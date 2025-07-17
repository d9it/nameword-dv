# Authentication System Documentation

## Overview

The authentication system has been unified to provide consistent, secure authentication across the entire application. This document outlines the implementation, usage, and best practices.

## Architecture

### Unified Authentication Middleware

The authentication system is centralized in `app/middlewares/auth.js` and provides:

- **Consistent token extraction** from multiple sources (Authorization header, session)
- **Unified error handling** with proper HTTP status codes
- **Role-based authorization** with flexible permission system
- **Account status validation** (banned, deactivated users)
- **Backward compatibility** with existing code

### Authentication Flow

1. **Token Extraction**: Checks Authorization header first, then session tokens
2. **Token Verification**: Validates JWT signature and expiration
3. **User/Admin Lookup**: Fetches user/admin from database
4. **Status Validation**: Checks for banned/deactivated accounts
5. **Context Setting**: Sets `req.user` or `req.admin` for downstream middleware

## Middleware Functions

### Current User Middleware (`currentUser`)

**Purpose**: Sets user context if valid token exists (non-blocking)

**Usage**:
```javascript
const { currentUser } = require('../app/middlewares/auth');

// Apply globally in app.js
app.use(currentUser);

// Or per-route
router.get('/profile', currentUser, requireAuth, controller.getProfile);
```

**Behavior**:
- Extracts token from Authorization header or session
- Validates token and fetches user
- Sets `req.user` if valid user found
- Continues request even if no valid token (non-blocking)
- Clears invalid session tokens

### Current Admin Middleware (`currentAdmin`)

**Purpose**: Sets admin context if valid token exists (non-blocking)

**Usage**:
```javascript
const { currentAdmin } = require('../app/middlewares/auth');

// Apply globally in app.js
app.use(currentAdmin);

// Or per-route
router.get('/admin/users', currentAdmin, requireAdminAuth, controller.listUsers);
```

**Behavior**:
- Extracts token from Authorization header or session
- Validates token and fetches admin
- Sets `req.admin` if valid admin found
- Continues request even if no valid token (non-blocking)
- Clears invalid session tokens

### Require User Authentication (`requireAuth`)

**Purpose**: Blocks requests without valid user authentication

**Usage**:
```javascript
const { requireAuth } = require('../app/middlewares/auth');

router.get('/protected', requireAuth, controller.getData);
```

**Behavior**:
- Returns 401 if `req.user` is not set
- Allows request to continue if user is authenticated

### Require Admin Authentication (`requireAdminAuth`)

**Purpose**: Blocks requests without valid admin authentication

**Usage**:
```javascript
const { requireAdminAuth } = require('../app/middlewares/auth');

router.get('/admin/dashboard', requireAdminAuth, controller.getDashboard);
```

**Behavior**:
- Returns 401 if `req.admin` is not set
- Allows request to continue if admin is authenticated

### Role-based Authorization (`requireRole`)

**Purpose**: Enforces role-based access control

**Usage**:
```javascript
const { requireRole } = require('../app/middlewares/auth');

// Single role
router.get('/admin/users', requireRole('admin'), controller.listUsers);

// Multiple roles
router.get('/super-admin', requireRole('admin', 'super_admin'), controller.superAdmin);
```

**Behavior**:
- Checks if authenticated user has required role
- Returns 401 if not authenticated
- Returns 403 if role not authorized

## Token Management

### Token Sources

The system extracts tokens from multiple sources in order of priority:

1. **Authorization Header**: `Bearer <token>`
2. **User Session**: `req.session.jwt`
3. **Admin Session**: `req.session.adminjwt`

### Token Types

- **User Tokens**: 7-day expiration, stored in `req.session.jwt`
- **Admin Tokens**: 24-hour expiration, stored in `req.session.adminjwt`

### Token Structure

```javascript
// User Token Payload
{
  id: "user_id",
  type: "user",
  iat: timestamp,
  exp: timestamp
}

// Admin Token Payload
{
  id: "admin_id", 
  type: "admin",
  iat: timestamp,
  exp: timestamp
}
```

## Error Handling

### Authentication Errors

- **401 Unauthorized**: No valid authentication
- **403 Forbidden**: Account banned or deactivated
- **401 Invalid Token**: Token expired or invalid

### Error Response Format

```javascript
{
  "success": false,
  "message": "Authentication required",
  "status": 401
}
```

## Security Features

### Account Status Validation

- **Banned Users**: Cannot authenticate, receive 403 error
- **Deactivated Users**: Cannot authenticate, receive 403 error
- **Invalid Tokens**: Automatically cleared from session

### Session Security

- **HttpOnly Cookies**: Prevents XSS attacks
- **Secure Cookies**: HTTPS-only in production
- **SameSite**: Prevents CSRF attacks
- **Automatic Cleanup**: Invalid tokens removed from session

### Token Security

- **JWT Signing**: Uses environment variable `JWT_KEY`
- **Expiration**: Automatic token expiration
- **Type Validation**: Distinguishes between user and admin tokens

## Usage Examples

### Protected User Route

```javascript
const { currentUser, requireAuth } = require('../app/middlewares/auth');

router.get('/user/profile', currentUser, requireAuth, (req, res) => {
  // req.user is guaranteed to exist
  res.json({ user: req.user });
});
```

### Protected Admin Route

```javascript
const { currentAdmin, requireAdminAuth } = require('../app/middlewares/auth');

router.get('/admin/users', currentAdmin, requireAdminAuth, (req, res) => {
  // req.admin is guaranteed to exist
  res.json({ admin: req.admin });
});
```

### Role-based Route

```javascript
const { requireRole } = require('../app/middlewares/auth');

router.post('/admin/users/:id/ban', requireRole('admin'), (req, res) => {
  // Only admins can access this route
  res.json({ message: 'User banned' });
});
```

### API Key + Authentication

```javascript
const { requireAuth } = require('../app/middlewares/auth');
const validateAPIKey = require('../app/middlewares/validate-apikey');

router.get('/api/data', validateAPIKey, requireAuth, (req, res) => {
  // Requires both API key and user authentication
  res.json({ data: 'protected' });
});
```

## Migration Guide

### From Old Middleware

**Before**:
```javascript
const isAuthenticated = require('../app/middlewares/auth').isAuthenticated;
const currentUser = require('../app/middlewares/current-user');
const requireAuth = require('../app/middlewares/require-auth');
```

**After**:
```javascript
const { currentUser, requireAuth } = require('../app/middlewares/auth');
```

### Global Application

**Before**: Authentication applied per-route
**After**: Authentication applied globally in `app.js`

```javascript
// app.js
const { currentUser, currentAdmin } = require('./app/middlewares/auth');

// Global authentication context
app.use(currentUser);
app.use(currentAdmin);
```

## Best Practices

### 1. Use Global Authentication

Apply `currentUser` and `currentAdmin` globally in `app.js` to ensure consistent authentication context across all routes.

### 2. Use Appropriate Middleware

- **`currentUser`/`currentAdmin`**: For setting context (non-blocking)
- **`requireAuth`/`requireAdminAuth`**: For protecting routes (blocking)
- **`requireRole`**: For role-based access control

### 3. Handle Errors Consistently

Use the unified error handling provided by the middleware:

```javascript
// The middleware handles authentication errors automatically
router.get('/protected', requireAuth, controller.getData);
```

### 4. Validate User Status

The middleware automatically validates user account status. Handle banned/deactivated users appropriately in your controllers.

### 5. Use Type-safe Tokens

Tokens include a `type` field to distinguish between user and admin tokens. Use this for additional validation if needed.

## Testing

### Unit Tests

```javascript
const { AuthUtils } = require('../app/utils/authUtils');

describe('Authentication', () => {
  test('should generate valid user token', () => {
    const user = { _id: 'user123' };
    const token = AuthUtils.generateUserToken(user);
    expect(token).toBeDefined();
  });
});
```

### Integration Tests

```javascript
const request = require('supertest');
const app = require('../app');

describe('Protected Routes', () => {
  test('should require authentication', async () => {
    const response = await request(app)
      .get('/api/v1/user/profile')
      .expect(401);
  });
});
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if token is valid and not expired
2. **403 Forbidden**: Check if user account is banned or deactivated
3. **Session Issues**: Check if cookies are properly configured
4. **Token Not Found**: Check Authorization header or session configuration

### Debug Mode

Enable debug logging by setting `DEBUG=auth:*` environment variable.

## Security Considerations

1. **JWT Secret**: Ensure `JWT_KEY` is strong and unique
2. **Token Expiration**: Use appropriate expiration times
3. **HTTPS**: Always use HTTPS in production
4. **Session Security**: Configure secure session settings
5. **Rate Limiting**: Apply rate limiting to authentication endpoints

## Future Enhancements

1. **Refresh Tokens**: Implement refresh token mechanism
2. **Multi-factor Authentication**: Add MFA support
3. **Permission System**: Implement granular permissions
4. **Audit Logging**: Add authentication audit trails
5. **Device Management**: Track and manage authenticated devices 