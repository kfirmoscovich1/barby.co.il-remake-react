import { useMediaUrl } from '@/hooks/useMediaUrl'

interface MediaImageProps {
    mediaId: string | undefined
    alt: string
    className?: string
    variant?: 'thumbnail'
    fallback?: React.ReactNode
}

/**
 * Image component that fetches base64 data from Firestore media documents.
 * Shows a shimmer skeleton while loading.
 */
export function MediaImage({ mediaId, alt, className = '', variant, fallback }: MediaImageProps) {
    const { url, isLoading } = useMediaUrl(mediaId, variant)

    if (!mediaId || (!isLoading && !url)) {
        return fallback ? <>{fallback}</> : null
    }

    if (isLoading) {
        return (
            <div className={`bg-barby-dark/60 animate-pulse ${className}`} />
        )
    }

    return (
        <img
            src={url}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={className}
        />
    )
}
