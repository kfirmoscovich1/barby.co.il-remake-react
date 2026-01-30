/**
 * @file keepAlive.ts
 * @description Keep-alive service to prevent the server from sleeping on free hosting plans.
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * 1. Pings server periodically to prevent cold starts
 * 2. Pings immediately when user returns to tab (visibility change)
 * 3. Uses lightweight /ping endpoint (no DB queries)
 * 4. Reduces first-load latency by keeping server warm
 * 
 * On Render's free tier, the server spins down after 15 minutes of inactivity.
 * This service pings the server periodically to keep it warm.
 */

import { API_BASE } from './api'

// PERFORMANCE: Ping every 8 minutes (before Render's 15-min timeout)
const PING_INTERVAL = 8 * 60 * 1000
const isDev = import.meta.env.DEV

let intervalId: ReturnType<typeof setInterval> | null = null
let isWarmedUp = false

/**
 * Get the base URL for endpoints
 * PERFORMANCE: Uses /ping for keep-alive, /warmup-full for initial warmup
 */
function getEndpointUrl(endpoint: string): string {
    // If API_BASE is just '/api' (dev proxy), use relative URL
    if (API_BASE === '/api') {
        return `/${endpoint}`
    }
    // If it's a full URL, extract the origin and append endpoint
    try {
        const url = new URL(API_BASE)
        return `${url.origin}/${endpoint}`
    } catch {
        // Fallback: remove /api suffix and add endpoint
        return API_BASE.replace(/\/api\/?$/, '') + `/${endpoint}`
    }
}

function getPingUrl(): string {
    return getEndpointUrl('ping')
}

function getWarmupUrl(): string {
    return getEndpointUrl('warmup-full')
}

/**
 * Ping the server's lightweight endpoint to keep it warm
 * PERFORMANCE: Uses HEAD request for minimal payload
 */
async function pingServer(): Promise<boolean> {
    try {
        const startTime = Date.now()
        const response = await fetch(getPingUrl(), {
            method: 'GET',
            headers: {
                'Accept': 'text/plain',
            },
            // PERFORMANCE: Don't include credentials for simple ping
            credentials: 'omit',
        })

        if (isDev && response.ok) {
            const duration = Date.now() - startTime
            console.log(`🏓 Ping response: ${duration}ms`)
        }

        return response.ok
    } catch (error) {
        if (isDev) console.warn('Keep-alive ping failed:', error)
        return false
    }
}

/**
 * Handle visibility change - ping when user returns to tab
 * PERFORMANCE: Ensures server is warm when user comes back
 */
function handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
        if (isDev) console.log('👀 Tab visible, pinging server...')
        pingServer()
    }
}

/**
 * Deep warmup that also warms the database connection
 * PERFORMANCE: This ensures DB is ready for first real request
 */
async function deepWarmup(): Promise<boolean> {
    try {
        const startTime = Date.now()
        const response = await fetch(getWarmupUrl(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'omit',
        })
        if (isDev && response.ok) {
            const data = await response.json()
            console.log(`🔥 Deep warmup: ${Date.now() - startTime}ms, DB ping: ${data.dbPing}ms`)
        }
        return response.ok
    } catch (error) {
        if (isDev) console.warn('Deep warmup failed:', error)
        return false
    }
}

/**
 * Warm up the server immediately when the app loads.
 * PERFORMANCE: Uses deep warmup to also warm the database connection
 */
export async function warmupServer(): Promise<void> {
    if (isWarmedUp) return

    try {
        const startTime = Date.now()
        // PERFORMANCE: First ping to wake up server process
        await pingServer()
        // PERFORMANCE: Then deep warmup to establish DB connection
        const success = await deepWarmup()
        if (success) {
            isWarmedUp = true
            if (isDev) console.log(`🔥 Full warmup completed in ${Date.now() - startTime}ms`)
        }
    } catch (error) {
        if (isDev) console.warn('Server warmup failed:', error)
    }
}

/**
 * Start the keep-alive ping interval.
 * This should be called once when the app initializes.
 * 
 * PERFORMANCE: Also adds visibility change listener to ping when tab becomes visible
 */
export function startKeepAlive(): void {
    if (intervalId) return // Already running

    // Initial warmup
    warmupServer()

    // Set up periodic pings
    intervalId = setInterval(() => {
        pingServer()
    }, PING_INTERVAL)

    // PERFORMANCE: Ping when user returns to tab after being away
    document.addEventListener('visibilitychange', handleVisibilityChange)

    if (isDev) console.log('🏃 Keep-alive service started (interval: 8 min)')
}

/**
 * Stop the keep-alive ping interval.
 * Call this when the app is unmounting (though usually not needed for SPAs).
 */
export function stopKeepAlive(): void {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        if (isDev) console.log('⏹️ Keep-alive service stopped')
    }
}

/**
 * Check if the server is currently responsive
 */
export async function checkServerStatus(): Promise<boolean> {
    return pingServer()
}
