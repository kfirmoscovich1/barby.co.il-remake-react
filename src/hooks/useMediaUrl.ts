import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// In-memory cache for media base64 URLs to avoid re-fetching
const mediaCache = new Map<string, string>()

async function fetchMediaUrl(mediaId: string, variant?: 'thumbnail'): Promise<string> {
    const cached = mediaCache.get(`${mediaId}-${variant || 'main'}`)
    if (cached) return cached

    const docSnap = await getDoc(doc(db, 'media', mediaId))
    if (!docSnap.exists()) return ''

    const data = docSnap.data()
    let base64: string
    let contentType: string

    if (variant === 'thumbnail' && data.variants?.length > 0) {
        const thumb = data.variants.find((v: { name: string }) => v.name === 'thumbnail')
        if (thumb) {
            base64 = thumb.dataBase64
            contentType = thumb.contentType
        } else {
            base64 = data.dataBase64
            contentType = data.contentType
        }
    } else {
        base64 = data.dataBase64
        contentType = data.contentType
    }

    if (!base64) return ''
    const url = `data:${contentType};base64,${base64}`

    // Cache both versions
    mediaCache.set(`${mediaId}-${variant || 'main'}`, url)
    return url
}

/**
 * Hook to fetch a media document's base64 data from Firestore.
 * Returns the data URL for use in <img> src.
 * Uses React Query for caching + in-memory cache for instant re-renders.
 */
export function useMediaUrl(mediaId: string | undefined, variant?: 'thumbnail') {
    const { data: url = '', isLoading } = useQuery({
        queryKey: ['media-url', mediaId, variant],
        queryFn: () => fetchMediaUrl(mediaId!, variant),
        enabled: !!mediaId && !mediaId.startsWith('data:') && !mediaId.startsWith('http'),
        staleTime: Infinity, // base64 data doesn't change
        gcTime: 1000 * 60 * 60, // keep in cache for 1 hour
    })

    // If it's already a URL or data URL, return it directly
    if (mediaId?.startsWith('data:') || mediaId?.startsWith('http')) {
        return { url: mediaId, isLoading: false }
    }

    return { url, isLoading }
}

/**
 * Pre-fetch media URLs for a list of IDs (for grid views).
 * Call this to warm the cache before rendering.
 */
export function prefetchMediaUrls(mediaIds: (string | undefined)[], variant?: 'thumbnail') {
    mediaIds.forEach(id => {
        if (id && !id.startsWith('data:') && !id.startsWith('http') && !mediaCache.has(`${id}-${variant || 'main'}`)) {
            fetchMediaUrl(id, variant).catch(() => { /* ignore */ })
        }
    })
}
