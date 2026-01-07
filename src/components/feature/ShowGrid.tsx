import type { Show } from '@/types'
import { ShowCard } from './ShowCard'
import { ShowGridSkeleton } from '@/components/common'
import { cn } from '@/utils'

interface ShowGridProps {
    shows: Show[]
    isLoading?: boolean
    emptyMessage?: string
    columns?: 2 | 3 | 4
}

export function ShowGrid({
    shows,
    isLoading,
    emptyMessage = 'לא נמצאו הופעות',
    columns = 3,
}: ShowGridProps) {
    if (isLoading) {
        return <ShowGridSkeleton count={columns * 2} />
    }

    if (shows.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-block p-8 card-vintage">
                    <svg className="w-16 h-16 mx-auto text-barby-gold/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <p className="text-barby-cream/60">{emptyMessage}</p>
                </div>
            </div>
        )
    }

    const gridCols = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-2 lg:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    }

    return (
        <div className={cn('grid grid-cols-1 gap-6', gridCols[columns])}>
            {shows.map((show) => (
                <ShowCard
                    key={show.id}
                    show={show}
                />
            ))}
        </div>
    )
}
