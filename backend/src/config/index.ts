import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/barby',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production',
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as string,
        refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string,
    },

    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },

    admin: {
        email: process.env.ADMIN_EMAIL || 'admin@barby.co.il',
        password: process.env.ADMIN_PASSWORD || 'admin123456',
    },

    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    },

    image: {
        maxWidth: 1920,
        maxHeight: 1080,
        thumbnailWidth: 400,
        thumbnailHeight: 300,
        quality: 80,
    },

    // Security settings
    security: {
        // HTTPS/SSL settings
        https: {
            enabled: process.env.HTTPS_ENABLED === 'true',
            keyPath: process.env.SSL_KEY_PATH || '',
            certPath: process.env.SSL_CERT_PATH || '',
        },

        // Rate limiting
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
        },

        // Brute force protection
        bruteForce: {
            maxAttempts: parseInt(process.env.BRUTE_FORCE_MAX_ATTEMPTS || '5', 10),
            lockoutDuration: parseInt(process.env.BRUTE_FORCE_LOCKOUT_MINUTES || '15', 10) * 60 * 1000,
        },

        // Session security
        session: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'strict' as const,
        },

        // Password requirements
        password: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
        },

        // Allowed origins for CORS
        allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
    },
} as const;

// Validate critical security settings in production
if (config.nodeEnv === 'production') {
    const warnings: string[] = [];

    if (config.jwt.secret.includes('fallback')) {
        warnings.push('⚠️  JWT_SECRET is using fallback value - SET A STRONG SECRET!');
    }

    if (config.jwt.refreshSecret.includes('fallback')) {
        warnings.push('⚠️  JWT_REFRESH_SECRET is using fallback value - SET A STRONG SECRET!');
    }

    if (config.admin.password === 'admin123456') {
        warnings.push('⚠️  ADMIN_PASSWORD is using default value - CHANGE IT!');
    }

    if (!config.security.https.enabled) {
        warnings.push('⚠️  HTTPS is not enabled - Enable for production!');
    }

    if (warnings.length > 0) {
        console.warn('\n🔒 SECURITY WARNINGS:');
        warnings.forEach(w => console.warn(w));
        console.warn('');
    }
}

