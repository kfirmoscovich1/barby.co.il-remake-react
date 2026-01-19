import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { cn } from '@/utils'
import { useAuth } from '@/context/AuthContext'
import { ScrollToTop } from '@/components/common'

const adminLinks = [
    { to: '/admin', label: 'לוח בקרה', icon: 'dashboard', end: true },
    { to: '/admin/shows', label: 'הופעות', icon: 'shows' },
    { to: '/admin/pages', label: 'עמודים', icon: 'pages' },
    { to: '/admin/faq', label: 'שאלות נפוצות', icon: 'faq' },
    { to: '/admin/media', label: 'מדיה', icon: 'media' },
    { to: '/admin/settings', label: 'הגדרות', icon: 'settings' },
]

const adminOnlyLinks = [
    { to: '/admin/users', label: 'משתמשים', icon: 'users' },
    { to: '/admin/audit', label: 'יומן פעולות', icon: 'audit' },
]

function getIcon(icon: string) {
    switch (icon) {
        case 'dashboard':
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        case 'shows':
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
            )
        case 'pages':
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        case 'media':
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        case 'settings':
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        case 'users':
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        case 'audit':
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            )
        case 'faq':
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        default:
            return null
    }
}

export function AdminShell() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { user, isAdmin, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-barby-black flex">
            <ScrollToTop />
            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 right-0 z-50 w-64 bg-barby-darker border-l border-barby-gold/20',
                    'transform transition-transform duration-300 lg:translate-x-0 lg:static',
                    isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-4 border-b border-barby-gold/20">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-xl font-frank font-bold text-barby-gold">בארבי</span>
                            <span className="text-xs text-barby-cream/50">ניהול</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-1">
                            {adminLinks.map((link) => (
                                <li key={link.to}>
                                    <NavLink
                                        to={link.to}
                                        end={link.end}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            cn(
                                                'flex items-center gap-3 px-4 py-2.5 rounded transition-colors',
                                                isActive
                                                    ? 'bg-barby-gold/10 text-barby-gold'
                                                    : 'text-barby-cream/70 hover:text-barby-gold hover:bg-barby-gold/5'
                                            )
                                        }
                                    >
                                        {getIcon(link.icon)}
                                        <span>{link.label}</span>
                                    </NavLink>
                                </li>
                            ))}

                            {isAdmin && (
                                <>
                                    <li className="pt-4 pb-2">
                                        <span className="px-4 text-xs text-barby-cream/40 uppercase tracking-wider">
                                            ניהול מערכת
                                        </span>
                                    </li>
                                    {adminOnlyLinks.map((link) => (
                                        <li key={link.to}>
                                            <NavLink
                                                to={link.to}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className={({ isActive }) =>
                                                    cn(
                                                        'flex items-center gap-3 px-4 py-2.5 rounded transition-colors',
                                                        isActive
                                                            ? 'bg-barby-gold/10 text-barby-gold'
                                                            : 'text-barby-cream/70 hover:text-barby-gold hover:bg-barby-gold/5'
                                                    )
                                                }
                                            >
                                                {getIcon(link.icon)}
                                                <span>{link.label}</span>
                                            </NavLink>
                                        </li>
                                    ))}
                                </>
                            )}
                        </ul>
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-barby-gold/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-barby-gold/20 flex items-center justify-center text-barby-gold font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-barby-cream truncate">{user?.name}</div>
                                <div className="text-xs text-barby-cream/50">{user?.role === 'admin' ? 'מנהל' : 'עורך'}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                to="/"
                                className="flex-1 px-3 py-2 text-xs text-center text-barby-cream/60 hover:text-barby-cream border border-barby-gold/20 hover:border-barby-gold/40 transition-colors"
                            >
                                לאתר
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex-1 px-3 py-2 text-xs text-barby-red hover:bg-barby-red/10 border border-barby-gold/20 hover:border-barby-red/40 transition-colors"
                            >
                                התנתקות
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-barby-black/90 backdrop-blur-sm border-b border-barby-gold/20">
                    <div className="flex items-center justify-between h-16 px-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-barby-cream hover:text-barby-gold transition-colors"
                            aria-label="פתח תפריט"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-barby-cream/60 text-sm">
                                שלום, {user?.name}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
