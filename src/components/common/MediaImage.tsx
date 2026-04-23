import { useState } from 'react'
import { useMediaUrl } from '@/hooks/useMediaUrl'

interface MediaImageProps {
    mediaId: string | undefined
    alt: string
    className?: string
    variant?: 'thumbnail'
    fallback?: React.ReactNode
}

export function MediaImage({ mediaId, alt, className = '', variant, fallback }: MediaImageProps) {
    const { url, isLoading } = useMediaUrl(mediaId, variant)
    const [imgLoaded, setImgLoaded] = useState(false)

    if (!mediaId || (!isLoading && !url)) {
        return fallback ? <>{fallback}</> : null
    }

    return (
        <div className={`relative ${className}`}>
            {/* Shimmer shown until image is fully decoded and painted */}
            {(!imgLoaded) && (
                <div className="absolute inset-0 bg-barby-dark/60 animate-pulse" />
            )}
            {url && (
                <img
                    src={url}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
            )}
        </div>
    )
}
