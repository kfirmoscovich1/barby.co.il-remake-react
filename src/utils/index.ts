import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
    })
}

export function formatTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        minimumFractionDigits: 0,
    }).format(price)
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

export function truncate(text: string, length: number): string {
    if (text.length <= length) return text
    return text.slice(0, length).trim() + '...'
}

export function debounce<T extends (...args: Parameters<T>) => void>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

export function getImageUrl(mediaIdOrUrl: string | undefined, fallback = '/placeholder.svg'): string {
    if (!mediaIdOrUrl) return fallback
    // If it's a data URL (base64), return as-is
    if (mediaIdOrUrl.startsWith('data:')) return mediaIdOrUrl
    // If it's an external URL (http/https), return as-is
    if (mediaIdOrUrl.startsWith('http://') || mediaIdOrUrl.startsWith('https://')) {
        return mediaIdOrUrl
    }
    // Otherwise, treat it as a media ID from MongoDB
    return `/api/media/${mediaIdOrUrl}`
}

export function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}
