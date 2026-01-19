import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 15, // 15 minutes - data is fresh for longer
            gcTime: 1000 * 60 * 60, // 1 hour - keep in cache longer
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch if data exists
            refetchOnReconnect: false,
        },
        mutations: {
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
