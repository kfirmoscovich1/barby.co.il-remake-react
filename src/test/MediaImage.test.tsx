import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MediaImage } from '@/components/common/MediaImage'

const mockUseMediaUrl = vi.fn()
vi.mock('@/hooks/useMediaUrl', () => ({
    useMediaUrl: (...args: unknown[]) => mockUseMediaUrl(...args),
}))

describe('MediaImage', () => {
    it('renders img when url is available', () => {
        mockUseMediaUrl.mockReturnValue({ url: 'data:image/png;base64,abc', isLoading: false })
        render(<MediaImage mediaId="media-1" alt="Test image" />)
        expect(screen.getByRole('img', { name: 'Test image' })).toBeInTheDocument()
        expect(screen.getByRole('img')).toHaveAttribute('src', 'data:image/png;base64,abc')
    })

    it('renders skeleton while loading', () => {
        mockUseMediaUrl.mockReturnValue({ url: null, isLoading: true })
        const { container } = render(<MediaImage mediaId="media-1" alt="Loading" />)
        expect(screen.queryByRole('img')).not.toBeInTheDocument()
        expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('renders fallback when no mediaId', () => {
        mockUseMediaUrl.mockReturnValue({ url: null, isLoading: false })
        render(
            <MediaImage
                mediaId={undefined}
                alt="no media"
                fallback={<div data-testid="fallback">Placeholder</div>}
            />
        )
        expect(screen.getByTestId('fallback')).toBeInTheDocument()
    })

    it('renders nothing when no mediaId and no fallback', () => {
        mockUseMediaUrl.mockReturnValue({ url: null, isLoading: false })
        const { container } = render(<MediaImage mediaId={undefined} alt="empty" />)
        expect(container.firstChild).toBeNull()
    })

    it('renders fallback when url resolves to null and not loading', () => {
        mockUseMediaUrl.mockReturnValue({ url: null, isLoading: false })
        render(
            <MediaImage
                mediaId="missing-id"
                alt="missing"
                fallback={<span>No image</span>}
            />
        )
        expect(screen.getByText('No image')).toBeInTheDocument()
    })
})
