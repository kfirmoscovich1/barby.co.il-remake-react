import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

function Bomb(): never {
    throw new Error('Kaboom!')
}

describe('ErrorBoundary', () => {
    // Suppress console.error during these tests
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders children when no error', () => {
        render(<ErrorBoundary><div>All good</div></ErrorBoundary>)
        expect(screen.getByText('All good')).toBeInTheDocument()
    })

    it('renders fallback UI when child throws', () => {
        render(
            <ErrorBoundary>
                <Bomb />
            </ErrorBoundary>
        )
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/משהו השתבש/)).toBeInTheDocument()
    })

    it('renders custom fallback when provided', () => {
        render(
            <ErrorBoundary fallback={<div>Custom Error</div>}>
                <Bomb />
            </ErrorBoundary>
        )
        expect(screen.getByText('Custom Error')).toBeInTheDocument()
    })

    it('resets error state when "נסה שוב" is clicked', () => {
        // Use a wrapper so we can swap children after reset
        let shouldThrow = true
        function MaybeThrow() {
            if (shouldThrow) throw new Error('Kaboom!')
            return <div>Recovered</div>
        }

        const { rerender } = render(
            <ErrorBoundary>
                <MaybeThrow />
            </ErrorBoundary>
        )
        expect(screen.getByRole('alert')).toBeInTheDocument()

        // Stop throwing, then click reset
        shouldThrow = false
        fireEvent.click(screen.getByRole('button', { name: 'נסה שוב' }))

        // After reset the boundary re-renders children — now they succeed
        rerender(
            <ErrorBoundary>
                <MaybeThrow />
            </ErrorBoundary>
        )
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        expect(screen.getByText('Recovered')).toBeInTheDocument()
    })
})
