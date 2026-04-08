/**
 * @file App.tsx
 * @description Root application component for the Barby Music Club frontend.
 * 
 * This component wraps the application with:
 * - React Query for server state management
 * - Authentication context provider
 * - React Router for client-side routing
 * - Toast notifications for user feedback
 * - Keep-alive service to prevent server from sleeping
 * - Data prefetching for faster perceived load times
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Parallel prefetching of critical data
 * - Keep-alive service to prevent cold starts
 * - React Query caching for reduced API calls
 */

import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { queryClient, queryKeys } from '@/services/queryClient'
import { router } from '@/router'
import { ErrorBoundary, SkipLink } from '@/components/common'
import { publicApi } from '@/services/api'

/**
 * PERFORMANCE: Prefetch critical data on app load using parallel requests
 */
async function prefetchCriticalData(): Promise<void> {
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: queryKeys.settings.public,
            queryFn: publicApi.getSettings,
            staleTime: 1000 * 60 * 15,
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.shows.list({ limit: 24 }),
            queryFn: () => publicApi.getShows({ limit: 24 }),
            staleTime: 1000 * 60 * 5,
        }),
    ]).catch((error) => {
        console.warn('Prefetch failed:', error)
    })
}

export function App() {
    useEffect(() => {
        prefetchCriticalData()
    }, [])
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <SkipLink />
                    <RouterProvider router={router} />
                    <Toaster
                        position="bottom-left"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#1a1a1a',
                                color: '#f5f0e1',
                                border: '2px solid rgba(201, 162, 39, 0.3)',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#c9a227',
                                    secondary: '#0a0a0a',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#8b0000',
                                    secondary: '#f5f0e1',
                                },
                            },
                        }}
                    />
                </AuthProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    )
}
