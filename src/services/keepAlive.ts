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
 * Get the base URL for warmup endpoint
 * PERFORMANCE: Uses /ping endpoint which doesn't touch DB
 */
function getPingUrl(): string {
    // If API_BASE is just '/api' (dev proxy), use relative URL
    if (API_BASE === '/api') {
        return '/ping'
    }
    // If it's a full URL, extract the origin and append /ping
    try {
        const url = new URL(API_BASE)
        return `${url.origin}/ping`
    } catch {
        // Fallback: remove /api suffix and add /ping
        return API_BASE.replace(/\/api\/?$/, '') + '/ping'
    }
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
 * Warm up the server immediately when the app loads.
 * This is called once to ensure the server is ready before user interactions.
 */
export async function warmupServer(): Promise<void> {
    if (isWarmedUp) return

    try {
        // PERFORMANCE: Send initial ping to wake up the server
        const startTime = Date.now()
        const success = await pingServer()
        if (success) {
            isWarmedUp = true
            if (isDev) console.log(`🔥 Server warmed up in ${Date.now() - startTime}ms`)
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
