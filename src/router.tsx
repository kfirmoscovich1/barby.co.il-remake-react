/**
 * @file router.tsx
 * @description Application routing configuration using React Router v6.
 * 
 * Route Structure:
 * - Public routes: Home, Shows, Archive, Static pages
 * - Protected routes: User profile (requires authentication)
 * - Admin routes: Dashboard, Shows, Pages, Media, Users, Settings (requires editor role)
 * 
 * Authentication:
 * - ProtectedRoute: Redirects to login if not authenticated
 * - EditorRoute: Redirects to home if not an editor/admin
 * 
 * Performance:
 * - Lazy loading for non-critical pages to reduce initial bundle size
 * - HomePage is loaded eagerly for fast first paint
 */

import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

// Loading component for lazy-loaded pages
function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barby-gold"></div>
        </div>
    )
}

// Lazy wrapper helper
function LazyPage({ component: Component }: { component: React.ComponentType }) {
    return (
        <Suspense fallback={<PageLoader />}>
            <Component />
        </Suspense>
    )
}

// Layout components - loaded eagerly (needed for all routes)
import { AppShell } from '@/components/layout/AppShell'
import { AdminShell } from '@/components/layout/AdminShell'

// HomePage loaded eagerly for fast first paint
import { HomePage } from '@/pages/HomePage'

// Lazy-loaded public pages
const ShowDetailPage = lazy(() => import('@/pages/ShowDetailPage').then(m => ({ default: m.ShowDetailPage })))
const ArchivePage = lazy(() => import('@/pages/ArchivePage').then(m => ({ default: m.ArchivePage })))
const PageContent = lazy(() => import('@/pages/PageContent').then(m => ({ default: m.PageContent })))
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage').then(m => ({ default: m.UserProfilePage })))
const GiftCardPage = lazy(() => import('@/pages/GiftCardPage').then(m => ({ default: m.GiftCardPage })))
const UnsubscribePage = lazy(() => import('@/pages/UnsubscribePage').then(m => ({ default: m.UnsubscribePage })))
const FAQPage = lazy(() => import('@/pages/FAQPage').then(m => ({ default: m.FAQPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

// Lazy-loaded admin pages
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

// Protected route wrapper
function ProtectedRoute({ requireAdmin = false }: { requireAdmin?: boolean }) {
    const { isAuthenticated, isAdmin, isEditor } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/admin" replace />
    }

    if (!isEditor) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

// Guest route wrapper (for login page)
function GuestRoute() {
    const { isAuthenticated, isEditor } = useAuth()

    if (isAuthenticated && isEditor) {
        return <Navigate to="/admin" replace />
    }

    return <Outlet />
}

// User authenticated route wrapper
function UserAuthRoute() {
    const { isAuthenticated } = useAuth()

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
            { path: '/show/:slug', element: <LazyPage component={ShowDetailPage} /> },
            { path: '/archive', element: <LazyPage component={ArchivePage} /> },
            // Dynamic pages from MongoDB
            { path: '/contact', element: <LazyPage component={PageContent} /> },
            { path: '/about', element: <LazyPage component={PageContent} /> },
            { path: '/terms', element: <LazyPage component={PageContent} /> },
            { path: '/accessibility', element: <LazyPage component={PageContent} /> },
            { path: '/privacy', element: <LazyPage component={PageContent} /> },
            // Special pages with forms/logic
            { path: '/unsubscribe', element: <LazyPage component={UnsubscribePage} /> },
            { path: '/faq', element: <LazyPage component={FAQPage} /> },
            { path: '/page/:slug', element: <LazyPage component={PageContent} /> },
            { path: '/giftcard', element: <LazyPage component={GiftCardPage} /> },
            { path: '*', element: <LazyPage component={NotFoundPage} /> },
        ],
    },
    {
        element: <UserAuthRoute />,
        children: [
            { path: '/account', element: <LazyPage component={UserProfilePage} /> },
        ],
    },
    {
        element: <GuestRoute />,
        children: [
            { path: '/login', element: <LazyPage component={LoginPage} /> },
            { path: '/forgot-password', element: <LazyPage component={ForgotPasswordPage} /> },
            { path: '/register', element: <LazyPage component={RegisterPage} /> },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AdminShell />,
                children: [
                    { path: '/admin', element: <LazyPage component={AdminDashboard} /> },
                    { path: '/admin/shows', element: <LazyPage component={AdminShows} /> },
                    { path: '/admin/shows/new', element: <LazyPage component={AdminShowEdit} /> },
                    { path: '/admin/shows/:id', element: <LazyPage component={AdminShowEdit} /> },
                    { path: '/admin/pages', element: <LazyPage component={AdminPages} /> },
                    { path: '/admin/pages/new', element: <LazyPage component={AdminPageEdit} /> },
                    { path: '/admin/pages/:id', element: <LazyPage component={AdminPageEdit} /> },
                    { path: '/admin/faq', element: <LazyPage component={AdminFAQ} /> },
                    { path: '/admin/settings', element: <LazyPage component={AdminSettings} /> },
                    { path: '/admin/media', element: <LazyPage component={AdminMedia} /> },
                    {
                        element: <ProtectedRoute requireAdmin />,
                        children: [
                            { path: '/admin/users', element: <LazyPage component={AdminUsers} /> },
                            { path: '/admin/audit', element: <LazyPage component={AdminAuditLog} /> },
                        ],
                    },
                ],
            },
        ],
    },
])
