/* eslint-disable react-refresh/only-export-components */
import { type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { Show } from '@/types'

function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    })
}

interface WrapperProps {
    children: ReactNode
    initialEntries?: string[]
}

function AllProviders({ children, initialEntries = ['/'] }: WrapperProps) {
    const queryClient = createTestQueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={initialEntries}>
                {children}
            </MemoryRouter>
        </QueryClientProvider>
    )
}

function renderWithProviders(ui: ReactNode, options?: RenderOptions & { initialEntries?: string[] }) {
    const { initialEntries, ...rest } = options ?? {}
    return render(ui, {
        wrapper: ({ children }) => <AllProviders initialEntries={initialEntries}>{children}</AllProviders>,
        ...rest,
    })
}

export { renderWithProviders, createTestQueryClient }

// Factory for test show objects
export function makeShow(overrides: Partial<Show> = {}): Show {
    return {
        id: 'show-1',
        title: 'Test Artist',
        slug: 'test-artist',
        dateISO: '2099-06-15T20:00:00.000Z',
        doorsTime: '20:00',
        description: 'Test description',
        status: 'available',
        isStanding: true,
        is360: false,
        venueName: 'Barby',
        venueAddress: 'Tel Aviv',
        ticketTiers: [{ label: 'כניסה', price: 80, currency: 'ILS' }],
        tags: [],
        featured: false,
        published: true,
        archived: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        createdBy: 'admin',
        updatedBy: 'admin',
        ...overrides,
    }
}
