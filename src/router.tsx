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
 */

import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

// Layout components
import { AppShell } from '@/components/layout/AppShell'
import { AdminShell } from '@/components/layout/AdminShell'

// Public pages
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

// Admin pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminShows } from '@/pages/admin/AdminShows'
import { AdminShowEdit } from '@/pages/admin/AdminShowEdit'
import { AdminPages } from '@/pages/admin/AdminPages'
import { AdminPageEdit } from '@/pages/admin/AdminPageEdit'
import { AdminSettings } from '@/pages/admin/AdminSettings'
import { AdminMedia } from '@/pages/admin/AdminMedia'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { AdminAuditLog } from '@/pages/admin/AdminAuditLog'
import { AdminFAQ } from '@/pages/admin/AdminFAQ'

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
            { path: '/show/:slug', element: <ShowDetailPage /> },
            { path: '/archive', element: <ArchivePage /> },
            // Dynamic pages from MongoDB
            { path: '/contact', element: <PageContent /> },
            { path: '/about', element: <PageContent /> },
            { path: '/terms', element: <PageContent /> },
            { path: '/accessibility', element: <PageContent /> },
            { path: '/privacy', element: <PageContent /> },
            // Special pages with forms/logic
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
                    {
                        element: <ProtectedRoute requireAdmin />,
                        children: [
                            { path: '/admin/users', element: <AdminUsers /> },
                            { path: '/admin/audit', element: <AdminAuditLog /> },
                        ],
                    },
                ],
            },
        ],
    },
])
