/**
 * @file queryClient.ts
 * @description React Query client configuration with performance-optimized caching.
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * 1. staleTime: Data stays fresh longer, reducing API calls
 * 2. gcTime: Cache persists longer, enabling instant navigation
 * 3. refetchOnWindowFocus: Disabled to prevent unnecessary requests
 * 4. refetchOnMount: Disabled when data exists in cache
 * 5. retry: Minimal retries to fail fast on errors
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // PERFORMANCE: Data considered fresh for 15 minutes
            // Prevents unnecessary refetches when navigating between pages
            staleTime: 1000 * 60 * 15,

            // PERFORMANCE: Keep data in cache for 1 hour
            // Enables instant page loads when navigating back
            gcTime: 1000 * 60 * 60,

            // PERFORMANCE: Only retry once to fail fast
            retry: 1,

            // PERFORMANCE: Don't refetch on window focus
            // Prevents unnecessary API calls when switching tabs
            refetchOnWindowFocus: false,

            // PERFORMANCE: Don't refetch if data exists in cache
            // Data will be used from cache until staleTime expires
            refetchOnMount: false,

            // PERFORMANCE: Don't refetch on reconnect
            // Prevents burst of requests after network recovery
            refetchOnReconnect: false,

            // PERFORMANCE: Use cached data while fetching fresh data
            // Provides instant UI with stale data, then updates
            networkMode: 'offlineFirst',
        },
        mutations: {
            // Mutations shouldn't retry by default
            retry: 0,
        },
    },
})

// Query keys factory
export const queryKeys = {
    // Auth
    auth: {
        me: ['auth', 'me'] as const,
    },

    // Public
    shows: {
        all: ['shows'] as const,
        list: (params?: Record<string, unknown>) => ['shows', 'list', params] as const,
        detail: (slug: string) => ['shows', 'detail', slug] as const,
    },
    archive: {
        all: ['archive'] as const,
        list: (params?: Record<string, unknown>) => ['archive', 'list', params] as const,
    },
    pages: {
        all: ['pages'] as const,
        detail: (slug: string) => ['pages', 'detail', slug] as const,
    },
    settings: {
        public: ['settings', 'public'] as const,
    },
    faq: {
        all: ['faq'] as const,
        list: ['faq', 'list'] as const,
    },

    // Admin
    admin: {
        shows: {
            all: ['admin', 'shows'] as const,
            list: (params?: Record<string, unknown>) => ['admin', 'shows', 'list', params] as const,
            detail: (id: string) => ['admin', 'shows', 'detail', id] as const,
        },
        pages: {
            all: ['admin', 'pages'] as const,
            list: (params?: Record<string, unknown>) => ['admin', 'pages', 'list', params] as const,
            detail: (id: string) => ['admin', 'pages', 'detail', id] as const,
        },
        users: {
            all: ['admin', 'users'] as const,
            list: (params?: Record<string, unknown>) => ['admin', 'users', 'list', params] as const,
            detail: (id: string) => ['admin', 'users', 'detail', id] as const,
        },
        media: {
            all: ['admin', 'media'] as const,
            list: (params?: Record<string, unknown>) => ['admin', 'media', 'list', params] as const,
        },
        faq: {
            all: ['admin', 'faq'] as const,
            list: ['admin', 'faq', 'list'] as const,
            detail: (id: string) => ['admin', 'faq', 'detail', id] as const,
        },
        settings: ['admin', 'settings'] as const,
        auditLogs: {
            all: ['admin', 'audit-logs'] as const,
            list: (params?: Record<string, unknown>) => ['admin', 'audit-logs', 'list', params] as const,
        },
    },

    // Gift Cards
    giftCards: {
        my: ['giftcards', 'my'] as const,
        purchased: ['giftcards', 'purchased'] as const,
        byCode: (code: string) => ['giftcards', 'code', code] as const,
    },

    // Orders
    orders: {
        my: ['orders', 'my'] as const,
        byId: (id: string) => ['orders', 'id', id] as const,
        byNumber: (orderNumber: string) => ['orders', 'number', orderNumber] as const,
    },
}
