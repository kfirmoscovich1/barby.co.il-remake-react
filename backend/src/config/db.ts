/**
 * @file db.ts
 * @description MongoDB connection module with connection pooling and performance optimizations.
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * 1. Single global connection - prevents reconnection overhead on each request
 * 2. Connection pooling - maintains pool of connections for concurrent requests
 * 3. Connection state tracking - prevents redundant connection attempts
 * 4. Keep-alive enabled - prevents connection drops during idle periods
 * 5. Compression - reduces data transfer size
 */

import mongoose from 'mongoose';
import { config } from './index.js';

// Track connection state to prevent multiple connection attempts
let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

/**
 * Get the current connection status
 * Used by health check endpoint to verify DB connectivity
 */
export function getConnectionState(): {
    isConnected: boolean;
    readyState: number;
    readyStateText: string;
} {
    const readyState = mongoose.connection.readyState;
    const stateMap: Record<number, string> = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    return {
        isConnected,
        readyState,
        readyStateText: stateMap[readyState] || 'unknown',
    };
}

/**
 * Connect to MongoDB with optimized connection pooling settings.
 * 
 * PERFORMANCE NOTES:
 * - Uses singleton pattern to ensure only ONE connection is created
 * - Connection options optimized for serverless/cold-start scenarios
 * - Pool size set to handle concurrent requests efficiently
 */
export async function connectDB(): Promise<void> {
    // If already connected, return immediately (prevents cold-start reconnection)
    if (isConnected && mongoose.connection.readyState === 1) {
        console.log('♻️  MongoDB already connected, reusing connection');
        return;
    }

    // If connection is in progress, wait for it (prevents race conditions)
    if (connectionPromise) {
        console.log('⏳ MongoDB connection in progress, waiting...');
        await connectionPromise;
        return;
    }

    try {
        const startTime = Date.now();

        // Connection options optimized for performance
        connectionPromise = mongoose.connect(config.mongodb.uri, {
            // CONNECTION POOLING: Maintain pool of connections for concurrent requests
            maxPoolSize: 10, // Maximum connections in pool
            minPoolSize: 2,  // Keep minimum connections warm

            // TIMEOUTS: Faster timeouts for quicker cold starts
            serverSelectionTimeoutMS: 3000, // Time to find a server (reduced)
            socketTimeoutMS: 30000, // Socket timeout for operations
            connectTimeoutMS: 5000, // Initial connection timeout (reduced)

            // KEEP-ALIVE: Prevent connection drops during idle periods
            heartbeatFrequencyMS: 10000, // Check connection health every 10s

            // PERFORMANCE: Enable compression for reduced data transfer
            compressors: ['zlib'],

            // RETRY: Handle transient failures
            retryWrites: true,
            retryReads: true,
        });

        await connectionPromise;
        isConnected = true;

        const duration = Date.now() - startTime;
        console.log(`✅ Connected to MongoDB in ${duration}ms`);
        console.log(`   Pool size: ${10}, Min pool: ${2}`);
    } catch (error) {
        connectionPromise = null;
        isConnected = false;
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Connection event handlers for monitoring
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
    isConnected = false;
    connectionPromise = null;
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
    isConnected = false;
});

mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
    isConnected = true;
});

// Log slow queries in development (performance debugging)
if (config.nodeEnv === 'development') {
    mongoose.set('debug', (collectionName: string, methodName: string, ...args: unknown[]) => {
        console.log(`📊 MongoDB: ${collectionName}.${methodName}`, args.length > 0 ? JSON.stringify(args[0]).slice(0, 100) : '');
    });
}
