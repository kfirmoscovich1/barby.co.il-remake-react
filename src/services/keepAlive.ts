/**
 * @file keepAlive.ts
 * @description Keep-alive service to prevent the server from sleeping on free hosting plans.
 * 
 * On Render's free tier, the server spins down after 15 minutes of inactivity.
 * This service pings the server periodically to keep it warm.
 */

import { API_BASE } from './api'

const PING_INTERVAL = 10 * 60 * 1000 // 10 minutes

let intervalId: ReturnType<typeof setInterval> | null = null
let isWarmedUp = false

/**
 * Get the base URL for warmup endpoint
 * Handles both '/api' (dev proxy) and full URLs like 'https://api.example.com/api'
 */
function getWarmupUrl(): string {
    // If API_BASE is just '/api' (dev proxy), use relative URL
    if (API_BASE === '/api') {
        return '/warmup'
    }
    // If it's a full URL, extract the origin and append /warmup
    try {
        const url = new URL(API_BASE)
        return `${url.origin}/warmup`
    } catch {
        // Fallback: remove /api suffix and add /warmup
        return API_BASE.replace(/\/api\/?$/, '') + '/warmup'
    }
}

/**
 * Ping the server's warmup endpoint to keep it warm
 */
async function pingServer(): Promise<boolean> {
    try {
        const response = await fetch(getWarmupUrl(), {
            method: 'GET',
            headers: {
                'Accept': 'text/plain',
            },
        })
        return response.ok
    } catch (error) {
        console.warn('Keep-alive ping failed:', error)
        return false
    }
}

/**
 * Warm up the server immediately when the app loads.
 * This is called once to ensure the server is ready before user interactions.
 */
export async function warmupServer(): Promise<void> {
    if (isWarmedUp) return
    
    try {
        // Send initial ping to wake up the server
        const success = await pingServer()
        if (success) {
            isWarmedUp = true
            console.log('🔥 Server warmed up successfully')
        }
    } catch (error) {
        console.warn('Server warmup failed:', error)
    }
}

/**
 * Start the keep-alive ping interval.
 * This should be called once when the app initializes.
 */
export function startKeepAlive(): void {
    if (intervalId) return // Already running
    
    // Initial warmup
    warmupServer()
    
    // Set up periodic pings
    intervalId = setInterval(() => {
        pingServer()
    }, PING_INTERVAL)
    
    console.log('🏃 Keep-alive service started')
}

/**
 * Stop the keep-alive ping interval.
 * Call this when the app is unmounting (though usually not needed for SPAs).
 */
export function stopKeepAlive(): void {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
        console.log('⏹️ Keep-alive service stopped')
    }
}

/**
 * Check if the server is currently responsive
 */
export async function checkServerStatus(): Promise<boolean> {
    return pingServer()
}
