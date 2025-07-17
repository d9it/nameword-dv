const request = require('supertest');
const app = require('../app');

describe('CSRF Protection Tests', () => {
  let csrfToken;
  let cookies;

  beforeAll(async () => {
    // Get CSRF token for testing
    const response = await request(app)
      .get('/api/auth/csrf-token')
      .expect(200);
    
    csrfToken = response.body.data.token;
    cookies = response.headers['set-cookie'];
  });

  describe('CSRF Token Generation', () => {
    test('should generate CSRF token', async () => {
      const response = await request(app)
        .get('/api/auth/csrf-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.expiresIn).toBe('24 hours');
    });
  });

  describe('CSRF Token Validation', () => {
    test('should accept valid CSRF token', async () => {
      const response = await request(app)
        .post('/api/auth/validate-csrf')
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send({ token: csrfToken })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should reject invalid CSRF token', async () => {
      const response = await request(app)
        .post('/api/auth/validate-csrf')
        .set('Cookie', cookies)
        .set('X-CSRF-Token', 'invalid-token')
        .send({ token: 'invalid-token' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('CSRF_ERROR');
    });

    test('should reject missing CSRF token', async () => {
      const response = await request(app)
        .post('/api/auth/validate-csrf')
        .set('Cookie', cookies)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Protected Routes', () => {
    test('should reject POST request without CSRF token', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Cookie', cookies)
        .send({ password: 'test123' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid CSRF token');
    });

    test('should accept POST request with valid CSRF token', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send({ password: 'test123' })
        .expect(401); // Should fail due to authentication, not CSRF

      // Should not be a CSRF error
      expect(response.body.error).not.toBe('CSRF_ERROR');
    });
  });

  describe('Excluded Routes', () => {
    test('should allow login without CSRF token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' })
        .expect(400); // Should fail due to validation, not CSRF

      expect(response.body.error).not.toBe('CSRF_ERROR');
    });

    test('should allow GET requests without CSRF token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401); // Should fail due to authentication, not CSRF

      expect(response.body.error).not.toBe('CSRF_ERROR');
    });
  });
}); 