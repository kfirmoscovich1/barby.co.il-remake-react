import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { ShowCard } from '@/components/feature/ShowCard'
import { renderWithProviders, makeShow } from './helpers'

// MediaImage renders nothing for Firestore IDs (no URL) — acceptable in unit tests
vi.mock('@/hooks/useMediaUrl', () => ({
    useMediaUrl: () => ({ url: null, isLoading: false }),
}))

describe('ShowCard', () => {
    it('renders show title', () => {
        renderWithProviders(<ShowCard show={makeShow({ title: 'Awesome Band' })} />)
        expect(screen.getByRole('heading', { name: /awesome band/i })).toBeInTheDocument()
    })

    it('links to show slug when available', () => {
        renderWithProviders(<ShowCard show={makeShow({ slug: 'awesome-band', id: 'show-1' })} />)
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', '/show/awesome-band')
    })

    it('links to show id when no slug', () => {
        renderWithProviders(<ShowCard show={makeShow({ slug: undefined, id: 'show-1' })} />)
        expect(screen.getByRole('link')).toHaveAttribute('href', '/show/show-1')
    })

    it('shows sold-out badge', () => {
        renderWithProviders(<ShowCard show={makeShow({ status: 'sold_out' })} />)
        expect(screen.getByText('הכרטיסים אזלו!')).toBeInTheDocument()
    })

    it('shows cancelled badge', () => {
        renderWithProviders(<ShowCard show={makeShow({ status: 'cancelled' })} />)
        expect(screen.getByText('בוטל')).toBeInTheDocument()
    })

    it('shows low-stock badge for few_left status', () => {
        renderWithProviders(<ShowCard show={makeShow({ status: 'few_left' })} />)
        expect(screen.getByText('כרטיסים בודדים!')).toBeInTheDocument()
    })

    it('renders doors time', () => {
        renderWithProviders(<ShowCard show={makeShow({ doorsTime: '21:00' })} />)
        expect(screen.getByText(/דלתות: 21:00/)).toBeInTheDocument()
    })

    it('falls back to -- when doorsTime is missing', () => {
        renderWithProviders(<ShowCard show={makeShow({ doorsTime: undefined })} />)
        expect(screen.getByText(/דלתות: --:--/)).toBeInTheDocument()
    })

    it('strips HTML from description', () => {
        renderWithProviders(<ShowCard show={makeShow({ description: '<p>Clean text</p>' })} />)
        expect(screen.getByText('Clean text')).toBeInTheDocument()
    })

    it('has accessible aria-label', () => {
        renderWithProviders(<ShowCard show={makeShow({ title: 'Artist X' })} />)
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('aria-label')
        expect(link.getAttribute('aria-label')).toContain('Artist X')
    })
})
