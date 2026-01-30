import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

// ==========================================
// Security Headers Middleware
// ==========================================

/**
 * Additional security headers beyond Helmet defaults
 */
export function securityHeaders(
    _req: Request,
    res: Response,
    next: NextFunction
): void {
    // Allow embedding in same origin (for PDF viewer)
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter in older browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Control referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy (formerly Feature-Policy)
    res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    // Content Security Policy for API
    if (config.nodeEnv === 'production') {
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; frame-ancestors 'self'"
        );
    }

    // Strict Transport Security (HSTS) - only in production with HTTPS
    if (config.nodeEnv === 'production') {
        res.setHeader(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        );
    }

    next();
}

// ==========================================
// Rate Limiters
// ==========================================

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit for development
    message: { success: false, error: 'יותר מדי בקשות, נסה שוב מאוחר יותר' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health';
    },
});

/**
 * Strict rate limiter for authentication routes
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login attempts per windowMs
    message: { success: false, error: 'יותר מדי ניסיונות התחברות, נסה שוב בעוד 15 דקות' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

/**
 * Rate limiter for password reset
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 password reset requests per hour
    message: { success: false, error: 'יותר מדי בקשות לאיפוס סיסמה, נסה שוב מאוחר יותר' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for file uploads
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // limit each IP to 50 uploads per hour
    message: { success: false, error: 'יותר מדי העלאות קבצים, נסה שוב מאוחר יותר' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ==========================================
// Input Sanitization
// ==========================================

/**
 * Sanitize request body to prevent NoSQL injection
 */
export function sanitizeInput(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    const sanitize = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;

        if (typeof obj === 'string') {
            // Remove potential MongoDB operators
            return obj.replace(/[${}]/g, '');
        }

        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }

        if (typeof obj === 'object') {
            const sanitized: any = {};
            for (const key of Object.keys(obj)) {
                // Block keys starting with $ (MongoDB operators)
                if (!key.startsWith('$')) {
                    sanitized[key] = sanitize(obj[key]);
                }
            }
            return sanitized;
        }

        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }

    if (req.query) {
        req.query = sanitize(req.query);
    }

    if (req.params) {
        req.params = sanitize(req.params);
    }

    next();
}

// ==========================================
// Request Validation
// ==========================================

/**
 * Validate Content-Type for POST/PUT/PATCH requests
 */
export function validateContentType(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const methodsRequiringBody = ['POST', 'PUT', 'PATCH'];

    if (methodsRequiringBody.includes(req.method)) {
        const contentType = req.headers['content-type'];

        // Skip validation for multipart/form-data (file uploads)
        if (contentType?.includes('multipart/form-data')) {
            return next();
        }

        // Require JSON content type for API requests
        if (!contentType?.includes('application/json')) {
            res.status(415).json({
                success: false,
                error: 'Content-Type must be application/json',
            });
            return;
        }
    }

    next();
}

// ==========================================
// HTTPS Redirect (for production)
// ==========================================

/**
 * Redirect HTTP to HTTPS in production
 */
export function httpsRedirect(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (config.nodeEnv === 'production') {
        // Check if behind a proxy (like nginx or load balancer)
        const proto = req.headers['x-forwarded-proto'];

        if (proto === 'http') {
            const host = req.headers.host || req.hostname;
            res.redirect(301, `https://${host}${req.url}`);
            return;
        }
    }

    next();
}

// ==========================================
// Brute Force Protection
// ==========================================

// In-memory store for failed login attempts (use Redis in production)
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: number }>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Check if IP is locked out due to failed login attempts
 */
export function checkBruteForce(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const attempts = failedLoginAttempts.get(ip);

    if (attempts) {
        const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;

        // Reset if lockout duration has passed
        if (timeSinceLastAttempt > LOCKOUT_DURATION) {
            failedLoginAttempts.delete(ip);
            return next();
        }

        // Block if too many attempts
        if (attempts.count >= MAX_FAILED_ATTEMPTS) {
            const remainingTime = Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 60000);
            res.status(429).json({
                success: false,
                error: `החשבון נעול זמנית. נסה שוב בעוד ${remainingTime} דקות`,
            });
            return;
        }
    }

    next();
}

/**
 * Record a failed login attempt
 */
export function recordFailedLogin(ip: string): void {
    const attempts = failedLoginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    failedLoginAttempts.set(ip, attempts);
}

/**
 * Clear failed login attempts on successful login
 */
export function clearFailedLogins(ip: string): void {
    failedLoginAttempts.delete(ip);
}

// ==========================================
// Request Size Limits
// ==========================================

/**
 * Validate request body size
 */
export function validateRequestSize(maxSize: number) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const contentLength = parseInt(req.headers['content-length'] || '0', 10);

        if (contentLength > maxSize) {
            res.status(413).json({
                success: false,
                error: 'הבקשה גדולה מדי',
            });
            return;
        }

        next();
    };
}

// ==========================================
// IP Blacklist (for known bad actors)
// ==========================================

const ipBlacklist = new Set<string>();

/**
 * Check if IP is blacklisted
 */
export function checkBlacklist(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const ip = req.ip || req.socket.remoteAddress || '';

    if (ipBlacklist.has(ip)) {
        res.status(403).json({
            success: false,
            error: 'גישה נדחתה',
        });
        return;
    }

    next();
}

/**
 * Add IP to blacklist
 */
export function blacklistIP(ip: string): void {
    ipBlacklist.add(ip);
}

/**
 * Remove IP from blacklist
 */
export function unblacklistIP(ip: string): void {
    ipBlacklist.delete(ip);
}
