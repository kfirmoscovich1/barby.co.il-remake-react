import { describe, it, expect } from 'vitest'
import { cn, formatPrice, slugify, truncate, getImageUrl } from '@/utils'

describe('cn', () => {
    it('merges class names', () => {
        expect(cn('a', 'b')).toBe('a b')
    })

    it('handles falsy values', () => {
        expect(cn('a', false, undefined, null, 'b')).toBe('a b')
    })

    it('handles conditional classes', () => {
        expect(cn('base', 'added', false)).toBe('base added')
    })
})

describe('formatPrice', () => {
    it('formats integer shekel amounts', () => {
        const result = formatPrice(80)
        expect(result).toContain('80')
        expect(result).toContain('₪')
    })

    it('formats zero', () => {
        expect(formatPrice(0)).toContain('0')
    })

    it('formats large amounts', () => {
        expect(formatPrice(1000)).toContain('1')
    })
})

describe('slugify', () => {
    it('lowercases and replaces spaces with hyphens', () => {
        expect(slugify('Hello World')).toBe('hello-world')
    })

    it('removes non-word characters', () => {
        expect(slugify('Hello, World!')).toBe('hello-world')
    })

    it('collapses multiple hyphens', () => {
        expect(slugify('hello   world')).toBe('hello-world')
    })

    it('trims leading and trailing hyphens', () => {
        expect(slugify('-hello-')).toBe('hello')
    })

    it('handles empty string', () => {
        expect(slugify('')).toBe('')
    })
})

describe('truncate', () => {
    it('returns text unchanged if within limit', () => {
        expect(truncate('short', 10)).toBe('short')
    })

    it('truncates long text with ellipsis', () => {
        const result = truncate('hello world', 5)
        expect(result).toBe('hello...')
    })

    it('returns exact-length text unchanged', () => {
        expect(truncate('hello', 5)).toBe('hello')
    })
})

describe('getImageUrl', () => {
    it('returns fallback for undefined', () => {
        expect(getImageUrl(undefined, '/fallback.png')).toBe('/fallback.png')
    })

    it('returns data URLs as-is', () => {
        const dataUrl = 'data:image/png;base64,abc123'
        expect(getImageUrl(dataUrl)).toBe(dataUrl)
    })

    it('returns https URLs as-is', () => {
        const url = 'https://example.com/image.jpg'
        expect(getImageUrl(url)).toBe(url)
    })

    it('returns fallback for Firestore media IDs', () => {
        expect(getImageUrl('abc123mediaId', '/fallback.png')).toBe('/fallback.png')
    })

    it('returns empty string by default for Firestore media IDs', () => {
        expect(getImageUrl('abc123mediaId')).toBe('')
    })
})
