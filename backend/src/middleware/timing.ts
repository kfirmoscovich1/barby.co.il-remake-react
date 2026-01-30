/**
 * @file timing.ts
 * @description Performance timing middleware for API request monitoring.
 * 
 * PERFORMANCE PURPOSE:
 * - Logs request start, database operations, and response times
 * - Helps identify slow endpoints and database queries
 * - Tracks cold start vs warm request performance
 * 
 * USAGE:
 * - Apply globally to measure all requests
 * - Logs include: route, method, duration, and status
 */

import type { Request, Response, NextFunction } from 'express';

// Track if this is the first request (cold start indicator)
let requestCount = 0;
let serverStartTime: number | null = null;

/**
 * Set the server start time for cold start detection
 */
export function setServerStartTime(): void {
    serverStartTime = Date.now();
}

/**
 * Performance timing middleware
 * 
 * LOGS:
 * - Request start with method and path
 * - Response completion with duration and status
 * - Cold start indicator for first request
 */
export function timingMiddleware(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    requestCount++;
    const reqNum = requestCount;

    // Cold start detection (first request within 60s of server start)
    const isColdStart = serverStartTime && (startTime - serverStartTime < 60000) && reqNum === 1;

    // Log request start (skip health/warmup endpoints to reduce noise)
    const isHealthCheck = req.path === '/health' || req.path === '/warmup' || req.path === '/ping';

    if (!isHealthCheck) {
        console.log(`🚀 [${reqNum}] ${req.method} ${req.path}${isColdStart ? ' (COLD START)' : ''}`);
    }

    // Capture response timing
    const originalSend = res.send.bind(res);
    res.send = function (body: unknown): Response {
        const duration = Date.now() - startTime;

        if (!isHealthCheck) {
            // Log with color coding based on duration
            const emoji = duration < 100 ? '⚡' : duration < 500 ? '✅' : duration < 1000 ? '⚠️' : '🐢';
            console.log(`${emoji} [${reqNum}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);

            // Warn about slow requests
            if (duration > 1000) {
                console.warn(`   ⚠️  SLOW REQUEST: ${req.path} took ${duration}ms`);
            }
        }

        return originalSend(body);
    };

    next();
}

/**
 * Utility to wrap database operations with timing
 * Use this to identify slow database queries
 * 
 * @example
 * const result = await timeQuery('getShows', async () => Show.find().limit(10));
 */
export async function timeQuery<T>(
    label: string,
    queryFn: () => Promise<T>
): Promise<T> {
    const startTime = Date.now();
    try {
        const result = await queryFn();
        const duration = Date.now() - startTime;

        // Log queries that take longer than 100ms
        if (duration > 100) {
            console.log(`   📊 DB Query [${label}]: ${duration}ms`);
        }

        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`   ❌ DB Query [${label}] FAILED: ${duration}ms`, error);
        throw error;
    }
}
