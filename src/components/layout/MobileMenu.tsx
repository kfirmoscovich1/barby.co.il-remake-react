import { useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { cn } from '@/utils'
import { useAuth } from '@/context/AuthContext'

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
    links: Array<{ to: string; label: string }>
}

export function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
    const { isAuthenticated, isEditor, logout } = useAuth()

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
        }
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Menu panel */}
            <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-barby-darker border-r border-barby-gold/30 animate-slide-up">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-barby-gold/20">
                        <span className="text-xl font-frank font-bold text-barby-gold">תפריט</span>
                        <button
                            onClick={onClose}
                            className="p-2 text-barby-cream hover:text-barby-gold transition-colors"
                            aria-label="סגור תפריט"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-2">
                            {links.map((link) => (
                                <li key={link.to}>
                                    <NavLink
                                        to={link.to}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            cn(
                                                'block px-4 py-3 text-lg font-medium transition-colors',
                                                'border-r-2',
                                                isActive
                                                    ? 'text-barby-gold border-barby-gold bg-barby-gold/10'
                                                    : 'text-barby-cream border-transparent hover:text-barby-gold hover:border-barby-gold/50 hover:bg-barby-gold/5'
                                            )
                                        }
                                    >
                                        {link.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-barby-gold/20 space-y-3">
                        {isAuthenticated && isEditor && (
                            <Link
                                to="/admin"
                                onClick={onClose}
                                className="block w-full btn-primary text-center"
                            >
                                ממשק ניהול
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <button
                                onClick={() => {
                                    logout()
                                    onClose()
                                }}
                                className="block w-full text-center text-barby-cream/60 hover:text-barby-gold text-sm transition-colors"
                            >
                                התנתק
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                onClick={onClose}
                                className="block w-full text-center text-barby-cream/60 hover:text-barby-gold text-sm transition-colors"
                            >
                                כניסה למערכת
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
