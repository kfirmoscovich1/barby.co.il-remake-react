/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, Outlet, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'

// Layout components
import { AppShell } from '@/components/layout/AppShell'
import { AdminShell } from '@/components/layout/AdminShell'

// Public pages (eagerly loaded for fast initial navigation)
import { HomePage } from '@/pages/HomePage'
import { ShowDetailPage } from '@/pages/ShowDetailPage'
import { ArchivePage } from '@/pages/ArchivePage'
import { PageContent } from '@/pages/PageContent'
import { LoginPage } from '@/pages/LoginPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { UserProfilePage } from '@/pages/UserProfilePage'
import { GiftCardPage } from '@/pages/GiftCardPage'
import { UnsubscribePage } from '@/pages/UnsubscribePage'
import { FAQPage } from '@/pages/FAQPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Admin pages (lazy loaded – only fetched when admin navigates to these routes)
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminShows = lazy(() => import('@/pages/admin/AdminShows').then(m => ({ default: m.AdminShows })))
const AdminShowEdit = lazy(() => import('@/pages/admin/AdminShowEdit').then(m => ({ default: m.AdminShowEdit })))
const AdminPages = lazy(() => import('@/pages/admin/AdminPages').then(m => ({ default: m.AdminPages })))
const AdminPageEdit = lazy(() => import('@/pages/admin/AdminPageEdit').then(m => ({ default: m.AdminPageEdit })))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })))
const AdminMedia = lazy(() => import('@/pages/admin/AdminMedia').then(m => ({ default: m.AdminMedia })))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })))
const AdminAuditLog = lazy(() => import('@/pages/admin/AdminAuditLog').then(m => ({ default: m.AdminAuditLog })))
const AdminFAQ = lazy(() => import('@/pages/admin/AdminFAQ').then(m => ({ default: m.AdminFAQ })))

function LazyFallback() {
    return <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-barby-gold border-t-transparent rounded-full animate-spin" />
    </div>
}

function SuspenseAdmin() {
    return <Suspense fallback={<LazyFallback />}><Outlet /></Suspense>
}

function AccessDenied() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-barby-dark" dir="rtl">
            <div className="text-center space-y-4 p-8 max-w-sm">
                <svg className="w-16 h-16 mx-auto text-barby-gold/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <h1 className="text-2xl font-frank font-bold text-barby-cream">גישה נדחתה</h1>
                <p className="text-barby-cream/60 text-sm">אין לך הרשאות מנהל לגשת לאזור זה</p>
                <Link
                    to="/"
                    className="inline-block mt-2 px-6 py-2 bg-barby-gold text-barby-dark font-bold text-sm hover:bg-barby-gold/80 transition-colors"
                >
                    חזרה לדף הבית
                </Link>
            </div>
        </div>
    )
}

// Protected route wrapper — admin access only
function ProtectedRoute() {
    const { isAuthenticated, isAdmin, isLoading } = useAuth()

    if (isLoading) return <LazyFallback />

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (!isAdmin) {
        return <AccessDenied />
    }

    return <Outlet />
}

// Guest route wrapper (for login page)
function GuestRoute() {
    const { isAuthenticated, isEditor, isLoading } = useAuth()

    if (isLoading) return <LazyFallback />

    if (isAuthenticated && isEditor) {
        return <Navigate to="/admin" replace />
    }

    return <Outlet />
}

// User authenticated route wrapper
function UserAuthRoute() {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) return <LazyFallback />

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <AppShell />
}

export const router = createBrowserRouter([
    {
        element: <AppShell />,
        children: [
            { path: '/', element: <HomePage /> },
            { path: '/show/:slug', element: <ShowDetailPage /> },
            { path: '/archive', element: <ArchivePage /> },
            // Dynamic pages from MongoDB
            { path: '/contact', element: <PageContent /> },
            { path: '/about', element: <PageContent /> },
            { path: '/terms', element: <PageContent /> },
            { path: '/accessibility', element: <PageContent /> },
            { path: '/privacy', element: <PageContent /> },
            // Pages with their own logic
            { path: '/unsubscribe', element: <UnsubscribePage /> },
            { path: '/faq', element: <FAQPage /> },
            { path: '/page/:slug', element: <PageContent /> },
            { path: '/giftcard', element: <GiftCardPage /> },
            { path: '*', element: <NotFoundPage /> },
        ],
    },
    {
        element: <UserAuthRoute />,
        children: [
            { path: '/account', element: <UserProfilePage /> },
        ],
    },
    {
        element: <GuestRoute />,
        children: [
            { path: '/login', element: <LoginPage /> },
            { path: '/forgot-password', element: <ForgotPasswordPage /> },
            { path: '/register', element: <RegisterPage /> },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AdminShell />,
                children: [
                    {
                        element: <SuspenseAdmin />,
                        children: [
                            { path: '/admin', element: <AdminDashboard /> },
                            { path: '/admin/shows', element: <AdminShows /> },
                            { path: '/admin/shows/new', element: <AdminShowEdit /> },
                            { path: '/admin/shows/:id', element: <AdminShowEdit /> },
                            { path: '/admin/pages', element: <AdminPages /> },
                            { path: '/admin/pages/new', element: <AdminPageEdit /> },
                            { path: '/admin/pages/:id', element: <AdminPageEdit /> },
                            { path: '/admin/faq', element: <AdminFAQ /> },
                            { path: '/admin/settings', element: <AdminSettings /> },
                            { path: '/admin/media', element: <AdminMedia /> },
                            { path: '/admin/users', element: <AdminUsers /> },
                            { path: '/admin/audit', element: <AdminAuditLog /> },
                        ],
                    },
                ],
            },
        ],
    },
])
