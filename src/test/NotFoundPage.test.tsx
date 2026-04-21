import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { renderWithProviders } from './helpers'

describe('NotFoundPage', () => {
    it('renders 404 heading', () => {
        renderWithProviders(<NotFoundPage />)
        expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument()
    })

    it('renders a link to the homepage', () => {
        renderWithProviders(<NotFoundPage />)
        const link = screen.getByRole('link', { name: /לעמוד הראשי/i })
        expect(link).toHaveAttribute('href', '/')
    })

    it('renders descriptive text', () => {
        renderWithProviders(<NotFoundPage />)
        expect(screen.getByText(/העמוד לא נמצא/i)).toBeInTheDocument()
    })
})
