import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { queryClient, queryKeys } from '@/services/queryClient'
import { router } from '@/router'
import { ErrorBoundary, SkipLink } from '@/components/common'
import { publicApi } from '@/services/api'
import { prefetchMediaUrls } from '@/hooks/useMediaUrl'

const SHOWS_LIMIT = 100

async function prefetchCriticalData(): Promise<void> {
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: queryKeys.settings.public,
            queryFn: publicApi.getSettings,
            staleTime: 1000 * 60 * 15,
        }),
        queryClient.prefetchInfiniteQuery({
            queryKey: queryKeys.shows.list({ limit: SHOWS_LIMIT }),
            queryFn: ({ pageParam }) => publicApi.getShows({ cursor: pageParam || undefined, limit: SHOWS_LIMIT }),
            initialPageParam: '',
            staleTime: 1000 * 60 * 5,
        }).then(() => {
            // Prefetch thumbnail images after shows are cached
            const cached = queryClient.getQueryData<{ pages: { items: { imageMediaId?: string; cardThumbnail?: string }[] }[] }>(
                queryKeys.shows.list({ limit: SHOWS_LIMIT })
            )
            const ids = cached?.pages?.flatMap(p => p.items).map(s => s.cardThumbnail || s.imageMediaId)
            if (ids?.length) prefetchMediaUrls(ids, 'thumbnail')
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
                    <RouterProvider router={router} future={{ v7_startTransition: true }} />
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
