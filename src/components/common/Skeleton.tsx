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

// Common skeleton patterns
export function ShowCardSkeleton() {
    return (
        <div className="card-vintage overflow-hidden">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        </div>
    )
}

export function ShowGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ShowCardSkeleton key={i} />
            ))}
        </div>
    )
}

export function PageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12 space-y-8">
            <Skeleton className="h-10 w-1/3" />
            <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
    )
}
