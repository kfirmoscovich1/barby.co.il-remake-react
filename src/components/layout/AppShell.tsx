import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ScrollToTop, ScrollToTopButton } from '@/components/common'

export function AppShell() {
    return (
        <div className="min-h-screen flex flex-col">
            <ScrollToTop />
            {/* Chandelier glow effect at top */}
            <div className="fixed inset-x-0 top-0 h-96 chandelier-glow pointer-events-none z-0" aria-hidden="true" />

            <Header />

            <main id="main-content" className="flex-1 relative z-10" role="main" tabIndex={-1}>
                <Outlet />
            </main>

            <Footer />

            {/* Scroll to top button */}
            <ScrollToTopButton />
        </div>
    )
}
