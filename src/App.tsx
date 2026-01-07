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
 */

import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { queryClient } from '@/services/queryClient'
import { router } from '@/router'
import { ErrorBoundary, SkipLink } from '@/components/common'
import { startKeepAlive, stopKeepAlive } from '@/services/keepAlive'

export function App() {
    // Start keep-alive service to prevent server from sleeping on free hosting
    useEffect(() => {
        startKeepAlive()
        return () => stopKeepAlive()
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
