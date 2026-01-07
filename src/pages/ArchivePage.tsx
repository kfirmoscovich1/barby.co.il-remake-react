import { publicApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { useInfiniteScroll } from '@/hooks'
import { Chandelier, ArchiveCard } from '@/components/feature'
import { NoArchiveContentMessage, LoadingError } from '@/components/common'

export function ArchivePage() {
    const limit = 18

    const { items: archivedShows, isLoading, isFetchingNextPage, hasNextPage, loadMoreRef, error } = useInfiniteScroll({
        queryKey: queryKeys.archive.list({ limit }),
        queryFn: (page) => publicApi.getArchive({ page, limit }),
        limit,
    })

    if (error && archivedShows.length === 0) {
        return <LoadingError onRetry={() => window.location.reload()} />
    }

    return (
        <div className="min-h-screen">
            {/* Chandelier Header */}
            <section className="relative py-6 md:py-10">
                <div className="flex justify-center">
                    <Chandelier size="xl" />
                </div>
            </section>

            {/* Title Banner */}
            <section className="bg-barby-gold py-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-barby-dark text-center">
                    ארכיון הופעות
                </h1>
            </section>

            {/* Archive Content */}
            <section className="container mx-auto px-4 pb-16">

                {/* Shows Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="aspect-square bg-barby-darker/50 animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : archivedShows.length === 0 ? (
                    <NoArchiveContentMessage />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {archivedShows.map((show) => (
                            <ArchiveCard key={show.id} show={show} />
                        ))}
                    </div>
                )}

                {/* Load More Trigger */}
                <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-8">
                    {isFetchingNextPage && (
                        <div className="flex items-center gap-3 text-barby-cream/60">
                            <div className="w-6 h-6 border-2 border-barby-gold border-t-transparent rounded-full animate-spin" />
                            <span>טוען עוד הופעות...</span>
                        </div>
                    )}
                    {!hasNextPage && archivedShows.length > 0 && (
                        <p className="text-barby-cream/40 text-sm">הגעת לסוף הארכיון</p>
                    )}
                </div>
            </section>
        </div>
    )
}
