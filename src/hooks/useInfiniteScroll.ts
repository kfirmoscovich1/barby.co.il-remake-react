import { useEffect, useRef, useCallback, useState } from 'react'
import { useInfiniteQuery, type InfiniteData, type QueryKey } from '@tanstack/react-query'
import type { PaginatedResponse } from '@/types'

interface UseInfiniteScrollOptions<T> {
    queryKey: QueryKey
    queryFn: (page: number) => Promise<PaginatedResponse<T>>
    limit?: number
    enabled?: boolean
    threshold?: number // pixels from bottom to trigger load
}

interface UseInfiniteScrollResult<T> {
    items: T[]
    isLoading: boolean
    isFetchingNextPage: boolean
    hasNextPage: boolean
    error: Error | null
    loadMoreRef: (node: HTMLDivElement | null) => void
    totalItems: number
}

export function useInfiniteScroll<T>({
    queryKey,
    queryFn,
    enabled = true,
    threshold = 300,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
    const observerRef = useRef<IntersectionObserver | null>(null)
    const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null)

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        error,
    } = useInfiniteQuery<PaginatedResponse<T>, Error, InfiniteData<PaginatedResponse<T>>, QueryKey, number>({
        queryKey,
        queryFn: async ({ pageParam }) => {
            return queryFn(pageParam)
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination && lastPage.pagination.page < lastPage.pagination.pages) {
                return lastPage.pagination.page + 1
            }
            return undefined
        },
        enabled,
    })

    // Flatten all pages into single items array
    const items = data?.pages.flatMap((page) => page.items) || []
    const totalItems = data?.pages[0]?.pagination?.total || 0

    // Setup intersection observer for infinite scroll
    const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
        setLoadMoreNode(node)
    }, [])

    useEffect(() => {
        if (!loadMoreNode) return

        // Cleanup previous observer
        if (observerRef.current) {
            observerRef.current.disconnect()
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            {
                rootMargin: `${threshold}px`,
            }
        )

        observerRef.current.observe(loadMoreNode)

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
            }
        }
    }, [loadMoreNode, hasNextPage, isFetchingNextPage, fetchNextPage, threshold])

    return {
        items,
        isLoading,
        isFetchingNextPage,
        hasNextPage: !!hasNextPage,
        error: error || null,
        loadMoreRef,
        totalItems,
    }
}
