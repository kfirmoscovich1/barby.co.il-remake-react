import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/utils'
import { useAuth } from '@/context/AuthContext'
import { MobileMenu } from './MobileMenu'

const navLinks = [
    { to: '/', label: 'עמוד הבית' },
    { to: '/account', label: 'החשבון שלי' },
    { to: '/giftcard', label: 'גיפט קארד' },
    { to: '/contact', label: 'צור קשר' },
    { to: '/about', label: 'אודות' },
]

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { isAuthenticated, isEditor, logout } = useAuth()

    return (
        <header className="sticky top-0 z-50" role="banner">
            {/* Top bar with social/contact */}
            <div className="bg-barby-darker/80 backdrop-blur-sm border-b border-barby-gold/20">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4" role="group" aria-label="קישורים לרשתות חברתיות">
                        <a
                            href="https://facebook.com/barbytlv"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-barby-cream/60 hover:text-barby-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold focus-visible:ring-offset-1 focus-visible:ring-offset-barby-dark rounded"
                            aria-label="עמוד הפייסבוק שלנו (נפתח בחלון חדש)"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                            </svg>
                        </a>
                        <a
                            href="https://instagram.com/barbytlv"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-barby-cream/60 hover:text-barby-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold focus-visible:ring-offset-1 focus-visible:ring-offset-barby-dark rounded"
                            aria-label="עמוד האינסטגרם שלנו (נפתח בחלון חדש)"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>
                    </div>
                    <div className="text-barby-cream/60">
                        <span>הנמל 1 - נמל יפו</span>
                        <span className="mx-2" aria-hidden="true">|</span>
                        <a
                            href="tel:03-5188123"
                            className="hover:text-barby-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold rounded"
                            aria-label="התקשרו אלינו: 03-5188123"
                        >
                            03-5188123
                        </a>
                    </div>
                </div>
            </div>

            {/* Main header */}
            <div className="bg-barby-darker/90 backdrop-blur-sm border-b border-barby-gold/20">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link
                            to="/"
                            className="flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold focus-visible:ring-offset-2 focus-visible:ring-offset-barby-dark rounded"
                            aria-label="בארבי - חזרה לדף הבית"
                        >
                            <img
                                src="/logo.webp"
                                alt="בארבי - בית ליוצרים ישראליים"
                                className="h-20 w-auto"
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8" aria-label="ניווט ראשי">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }: { isActive: boolean }) =>
                                        cn(
                                            'text-base font-medium transition-colors relative py-2',
                                            'after:absolute after:bottom-0 after:right-0 after:h-0.5',
                                            'after:bg-barby-gold after:transition-all after:duration-300',
                                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold focus-visible:ring-offset-1 focus-visible:ring-offset-barby-dark rounded',
                                            isActive
                                                ? 'text-barby-gold after:w-full'
                                                : 'text-barby-cream hover:text-barby-gold after:w-0 hover:after:w-full'
                                        )
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}

                            {isAuthenticated && isEditor && (
                                <Link
                                    to="/admin"
                                    className="btn-secondary text-xs py-2 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold"
                                    aria-label="כניסה לממשק ניהול"
                                >
                                    ניהול
                                </Link>
                            )}

                            {isAuthenticated && (
                                <button
                                    onClick={logout}
                                    className="text-base font-medium text-barby-cream/60 hover:text-barby-red transition-colors py-2 relative after:absolute after:bottom-0 after:right-0 after:h-0.5 after:bg-barby-red after:transition-all after:duration-300 after:w-0 hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold focus-visible:ring-offset-1 focus-visible:ring-offset-barby-dark rounded"
                                    aria-label="התנתק מהמערכת"
                                >
                                    התנתק
                                </button>
                            )}
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-barby-cream hover:text-barby-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold rounded"
                            aria-label="פתח תפריט ניווט"
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                links={navLinks}
            />
        </header>
    )
}
