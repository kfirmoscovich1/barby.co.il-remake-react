/**
 * @file index.ts
 * @description Entry point for the Barby Music Club backend API server.
 * 
 * Features:
 * - Express.js REST API
 * - MongoDB database with Mongoose ODM
 * - JWT authentication with refresh tokens
 * - Rate limiting and brute force protection
 * - Helmet security headers
 * - CORS configuration
 * - File upload handling with Sharp image processing
 * 
 * API Routes:
 * - /api/auth - Authentication (login, register, refresh)
 * - /api/public - Public data (shows, pages, settings)
 * - /api/admin - Admin operations (CRUD for all entities)
 * - /api/media - Media upload and management
 * 
 * @see https://github.com/your-username/barby.co.il
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import {
    errorHandler,
    notFoundHandler,
    securityHeaders,
    apiLimiter,
    authLimiter,
    sanitizeInput,
    httpsRedirect,
    checkBlacklist,
} from './middleware/index.js';
import { authRoutes, publicRoutes, adminRoutes, mediaRoutes, giftcardRoutes, orderRoutes } from './routes/index.js';

const app = express();

// Trust proxy (for rate limiting behind nginx/load balancer)
app.set('trust proxy', 1);

// HTTPS redirect in production
app.use(httpsRedirect);

// IP Blacklist check
app.use(checkBlacklist);

// Security middleware - Helmet with enhanced configuration
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginEmbedderPolicy: false, // Disable for external images
    frameguard: { action: 'sameorigin' }, // Allow iframes from same origin (for PDF viewer)
    contentSecurityPolicy: config.nodeEnv === 'production' ? {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"],
            frameSrc: ["'self'"], // Allow iframes from same origin
            objectSrc: ["'self'", 'blob:'], // Allow PDF objects
            upgradeInsecureRequests: [],
        },
    } : false,
    hsts: config.nodeEnv === 'production' ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    } : false,
}));

// Additional security headers
app.use(securityHeaders);

// CORS with strict configuration
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 600, // 10 minutes
}));

// General API rate limiting
app.use(apiLimiter);

// Enable gzip/deflate compression for all responses
app.use(compression());

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize all inputs
app.use(sanitizeInput);

// Health check (no auth required) - used by Render health checks
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Keep-alive/warmup endpoint - lightweight response to prevent server from sleeping
app.get('/warmup', (_req, res) => {
    res.status(200).send('ok');
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/giftcards', giftcardRoutes);
app.use('/api/orders', orderRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function start() {
    try {
        await connectDB();

        app.listen(config.port, () => {
            console.log(`🚀 Server running on http://localhost:${config.port}`);
            console.log(`📦 Environment: ${config.nodeEnv}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
