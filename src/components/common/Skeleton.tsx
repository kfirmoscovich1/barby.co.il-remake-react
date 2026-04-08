import { cn } from '@/utils'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
}

export function Skeleton({
    className,
    variant = 'rectangular',
    width,
    height,
}: SkeletonProps) {
    const variants = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded',
    }

    return (
        <div
            className={cn('skeleton', variants[variant], className)}
            style={{
                width: width,
                height: height,
            }}
        />
    )
}

// Skeleton matching ShowCard design
export function ShowCardSkeleton() {
    return (
        <div className="bg-barby-darker/40 border border-barby-gold/10 rounded-lg overflow-hidden animate-pulse">
            {/* Image area */}
            <div className="aspect-square bg-barby-dark/60" />
            {/* Info area matching h-[100px] of ShowCard */}
            <div className="p-3 h-[100px] flex flex-col">
                <div className="h-4 bg-barby-dark/60 rounded w-3/4" />
                <div className="h-3 bg-barby-dark/40 rounded w-1/2 mt-2" />
                <div className="mt-auto space-y-1.5">
                    <div className="h-3 bg-barby-dark/40 rounded w-2/3" />
                    <div className="h-3 bg-barby-dark/40 rounded w-1/3" />
                </div>
            </div>
        </div>
    )
}

export function ShowGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <ShowCardSkeleton key={i} />
            ))}
        </div>
    )
}

// Skeleton for ShowDetailPage
export function ShowDetailSkeleton() {
    return (
        <div className="min-h-screen animate-pulse">
            <section className="relative py-6 md:py-10">
                <div className="flex justify-center">
                    <div className="w-64 h-64 bg-barby-dark/40 rounded-full" />
                </div>
            </section>
            <div className="container mx-auto px-4 mb-4">
                <div className="h-4 w-24 bg-barby-dark/40 rounded" />
            </div>
            <section className="container mx-auto px-4 pb-8">
                <div className="bg-barby-burgundy/20 border-2 border-barby-gold/10 rounded-lg overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        <div className="lg:w-2/5 aspect-square bg-barby-dark/60" />
                        <div className="lg:w-3/5 p-6 lg:p-8 space-y-4">
                            <div className="h-8 bg-barby-dark/60 rounded w-2/3" />
                            <div className="h-5 bg-barby-dark/40 rounded w-1/2" />
                            <div className="h-4 bg-barby-dark/30 rounded w-1/3" />
                            <div className="space-y-2 mt-6">
                                <div className="h-4 bg-barby-dark/30 rounded w-full" />
                                <div className="h-4 bg-barby-dark/30 rounded w-full" />
                                <div className="h-4 bg-barby-dark/30 rounded w-3/4" />
                            </div>
                            <div className="mt-auto pt-8">
                                <div className="bg-barby-dark/40 rounded-lg p-4 space-y-3">
                                    <div className="h-10 bg-barby-dark/50 rounded w-full" />
                                    <div className="h-10 bg-barby-dark/50 rounded w-full" />
                                    <div className="h-12 bg-barby-gold/10 rounded w-full mt-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

// Skeleton for TodayShow component
export function TodayShowSkeleton() {
    return (
        <div className="bg-barby-burgundy/20 border-2 border-barby-gold/10 rounded-lg overflow-hidden max-w-md mx-auto animate-pulse">
            <div className="flex flex-col sm:flex-row">
                <div className="sm:w-40 md:w-48 aspect-square bg-barby-dark/60 flex-shrink-0" />
                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center space-y-2">
                    <div className="h-5 w-24 bg-barby-gold/10 rounded-full" />
                    <div className="h-6 bg-barby-dark/60 rounded w-3/4" />
                    <div className="h-3 bg-barby-dark/40 rounded w-full" />
                    <div className="h-3 bg-barby-dark/30 rounded w-2/3" />
                </div>
            </div>
        </div>
    )
}

export function PageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12 space-y-8 animate-pulse">
            <div className="h-10 w-1/3 bg-barby-dark/60 rounded" />
            <div className="space-y-4">
                <div className="h-4 w-full bg-barby-dark/40 rounded" />
                <div className="h-4 w-full bg-barby-dark/40 rounded" />
                <div className="h-4 w-3/4 bg-barby-dark/30 rounded" />
                <div className="h-4 w-full bg-barby-dark/40 rounded" />
                <div className="h-4 w-5/6 bg-barby-dark/30 rounded" />
            </div>
        </div>
    )
}
