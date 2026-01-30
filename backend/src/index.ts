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
 * - PERFORMANCE: Request timing, connection pooling, caching
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
import { connectDB, getConnectionState } from './config/db.js';
import {
    errorHandler,
    notFoundHandler,
    securityHeaders,
    apiLimiter,
    authLimiter,
    sanitizeInput,
    httpsRedirect,
    checkBlacklist,
    timingMiddleware,
    setServerStartTime,
} from './middleware/index.js';
import { authRoutes, publicRoutes, adminRoutes, mediaRoutes, giftcardRoutes, orderRoutes } from './routes/index.js';

const app = express();

// Trust proxy (for rate limiting behind nginx/load balancer)
app.set('trust proxy', 1);

// PERFORMANCE: Request timing middleware (add early to measure full request lifecycle)
app.use(timingMiddleware);

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

// PERFORMANCE: Enable gzip/deflate compression for all responses
app.use(compression({
    level: 6, // Balance between speed and compression ratio
    threshold: 1024, // Only compress responses > 1KB
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize all inputs
app.use(sanitizeInput);

/**
 * PERFORMANCE: Lightweight ping endpoint for cold start mitigation
 * - Does NOT touch database
 * - Returns immediately
 * - Used by keep-alive service and uptime monitors
 */
app.get('/ping', (_req, res) => {
    res.status(200).send('pong');
});

/**
 * PERFORMANCE: Deep warmup endpoint that warms up DB connection
 * - Touches database to ensure connection is fully established
 * - Use this for initial warmup, /ping for subsequent keep-alive
 */
app.get('/warmup-full', async (_req, res) => {
    try {
        const startTime = Date.now();
        // Touch the database to ensure connection is warm
        await import('mongoose').then(m => m.default.connection.db?.admin().ping());
        const duration = Date.now() - startTime;
        res.json({ status: 'warm', dbPing: duration });
    } catch (error) {
        res.json({ status: 'warming', error: 'DB not ready' });
    }
});

/**
 * PERFORMANCE: Health check with optional DB status
 * - Fast response for load balancers
 * - Includes DB connection state for debugging
 */
app.get('/health', (_req, res) => {
    const dbState = getConnectionState();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        db: dbState,
    });
});

/**
 * PERFORMANCE: Keep-alive/warmup endpoint
 * - Lightweight response to prevent server from sleeping
 * - Used by frontend keep-alive service
 */
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
        // PERFORMANCE: Track server start time for cold start detection
        setServerStartTime();

        const dbStartTime = Date.now();
        await connectDB();
        console.log(`📊 Database connection time: ${Date.now() - dbStartTime}ms`);

        app.listen(config.port, () => {
            console.log(`🚀 Server running on http://localhost:${config.port}`);
            console.log(`📦 Environment: ${config.nodeEnv}`);
            console.log(`⏱️  Server ready for requests`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
