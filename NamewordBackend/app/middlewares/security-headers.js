/**
 * Comprehensive Security Headers Middleware
 * Provides enhanced security headers to protect against various attacks
 * Updated to remove deprecated headers and use modern alternatives
 */

const securityHeaders = (req, res, next) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Frame protection via CSP frame-ancestors (modern alternative to X-Frame-Options)
    // X-Frame-Options is deprecated in favor of CSP frame-ancestors
    
    // XSS protection via CSP (modern alternative to X-XSS-Protection)
    // X-XSS-Protection is deprecated in favor of CSP
    
    // Strict Transport Security (HSTS)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy (formerly Feature Policy)
    res.setHeader('Permissions-Policy', [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()',
        'ambient-light-sensor=()',
        'autoplay=()',
        'encrypted-media=()',
        'fullscreen=(self)',
        'picture-in-picture=()',
        'publickey-credentials-get=()',
        'screen-wake-lock=()',
        'sync-xhr=()',
        'web-share=()',
        'xr-spatial-tracking=()'
    ].join(', '));
    
    // Content Security Policy (CSP) - Modern XSS protection
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
        "img-src 'self' data: https: blob:",
        "media-src 'self' https:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'", // Modern frame protection
        "connect-src 'self' https: wss:",
        "worker-src 'self' blob:",
        "child-src 'self' blob:",
        "manifest-src 'self'",
        "upgrade-insecure-requests"
    ];
    
    res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
    
    // Cross-Origin Resource Policy
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    
    // Cross-Origin Opener Policy
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    
    // Cross-Origin Embedder Policy
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    
    // Origin-Agent-Cluster
    res.setHeader('Origin-Agent-Cluster', '?1');
    
    // X-DNS-Prefetch-Control
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    
    // X-Permitted-Cross-Domain-Policies
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    
    // Cache-Control for sensitive routes
    if (req.path.includes('/api/auth') || req.path.includes('/api/admin')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    
    // Remove server information
    res.removeHeader('Server');
    res.removeHeader('X-Powered-By');
    
    next();
};

/**
 * Enhanced Helmet Configuration
 * Provides additional security configurations for Helmet
 * Updated to remove deprecated headers
 */
const helmetConfig = {
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://cdn.jsdelivr.net",
                "https://unpkg.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://cdn.jsdelivr.net"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdn.jsdelivr.net"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "blob:"
            ],
            mediaSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"], // Modern frame protection
            connectSrc: ["'self'", "https:", "wss:"],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["'self'", "blob:"],
            manifestSrc: ["'self'"],
            upgradeInsecureRequests: []
        }
    },
    
    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: { policy: "require-corp" },
    
    // Cross-Origin Opener Policy
    crossOriginOpenerPolicy: { policy: "same-origin" },
    
    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: { policy: "same-site" },
    
    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },
    
    // Frameguard (modern frame protection)
    frameguard: { action: "deny" },
    
    // Hide Powered By
    hidePoweredBy: true,
    
    // HSTS
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    
    // No Sniff
    noSniff: true,
    
    // Permissions Policy
    permissionsPolicy: {
        features: {
            camera: [],
            microphone: [],
            geolocation: [],
            payment: [],
            usb: [],
            magnetometer: [],
            gyroscope: [],
            accelerometer: [],
            ambientLightSensor: [],
            autoplay: [],
            encryptedMedia: [],
            fullscreen: ["'self'"],
            pictureInPicture: [],
            publickeyCredentialsGet: [],
            screenWakeLock: [],
            syncXhr: [],
            webShare: [],
            xrSpatialTracking: []
        }
    },
    
    // Referrer Policy
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
    
    // Removed deprecated headers:
    // - xssFilter (X-XSS-Protection) - deprecated in favor of CSP
    // - ieNoOpen (X-Download-Options) - IE-only, no longer needed
    // - expectCt - deprecated by Chrome
};

/**
 * Security Headers for API Routes
 * Additional headers specifically for API endpoints
 */
const apiSecurityHeaders = (req, res, next) => {
    // Additional security for API routes
    res.setHeader('X-API-Version', '1.0');
    res.setHeader('X-Request-ID', req.id || Date.now().toString());
    
    // Rate limiting headers
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', res.getHeader('X-RateLimit-Remaining') || '100');
    res.setHeader('X-RateLimit-Reset', res.getHeader('X-RateLimit-Reset') || Date.now() + 900000);
    
    next();
};

/**
 * Security Headers for Admin Routes
 * Stricter security for admin endpoints
 */
const adminSecurityHeaders = (req, res, next) => {
    // Stricter CSP for admin routes
    const adminCspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'", // Modern frame protection
        "connect-src 'self'",
        "upgrade-insecure-requests"
    ];
    
    res.setHeader('Content-Security-Policy', adminCspDirectives.join('; '));
    
    // No caching for admin routes
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
};

module.exports = {
    securityHeaders,
    helmetConfig,
    apiSecurityHeaders,
    adminSecurityHeaders
}; 