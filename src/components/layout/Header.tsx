import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/utils'
import { useAuth } from '@/context/AuthContext'
import { publicApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { MobileMenu } from './MobileMenu'
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaSpotify, FaWhatsapp } from 'react-icons/fa'
import type { IconType } from 'react-icons'

const SOCIAL_ICONS: Record<string, IconType> = {
    facebook: FaFacebookF,
    instagram: FaInstagram,
    twitter: FaTwitter,
    youtube: FaYoutube,
    tiktok: FaTiktok,
    spotify: FaSpotify,
    whatsapp: FaWhatsapp,
}

const SOCIAL_LABELS: Record<string, string> = {
    facebook: 'עמוד הפייסבוק שלנו',
    instagram: 'עמוד האינסטגרם שלנו',
    twitter: 'עמוד הטוויטר שלנו',
    youtube: 'ערוץ היוטיוב שלנו',
    tiktok: 'עמוד הטיקטוק שלנו',
    spotify: 'ספוטיפיי שלנו',
    whatsapp: 'וואטסאפ שלנו',
}

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

    const { data: settingsData } = useQuery({
        queryKey: queryKeys.settings.public,
        queryFn: publicApi.getSettings,
    })
    const socialLinks = settingsData?.settings?.footer?.socialLinks || []

    return (
        <header className="sticky top-0 z-50" role="banner">
            {/* Top bar with social/contact */}
            <div className="bg-barby-darker/80 backdrop-blur-sm border-b border-barby-gold/20">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4" role="group" aria-label="קישורים לרשתות חברתיות">
                        {socialLinks.map((link, index) => {
                            const Icon = SOCIAL_ICONS[link.platform]
                            if (!Icon) return null
                            return (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-barby-cream/60 hover:text-barby-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold focus-visible:ring-offset-1 focus-visible:ring-offset-barby-dark rounded"
                                    aria-label={`${SOCIAL_LABELS[link.platform] || link.platform} (נפתח בחלון חדש)`}
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            )
                        })}
                    </div>
                    <div className="text-barby-cream/60">
                        <span>נמל יפו 1, יפו</span>
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
