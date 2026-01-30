import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/common'
import { useAuth } from '@/context/AuthContext'

export function AdminDashboard() {
    const { isAdmin } = useAuth()

    const { data: showsData, isLoading: isLoadingShows } = useQuery({
        queryKey: queryKeys.admin.shows.list({ limit: 5 }),
        queryFn: () => adminApi.getShows({ limit: 5 }),
    })

    const { data: pagesData, isLoading: isLoadingPages } = useQuery({
        queryKey: queryKeys.admin.pages.list({ limit: 5 }),
        queryFn: () => adminApi.getPages({ limit: 5 }),
    })

    const stats = [
        {
            label: 'הופעות פעילות',
            value: showsData?.total ?? '-',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
            ),
            link: '/admin/shows',
        },
        {
            label: 'עמודים',
            value: pagesData?.total ?? '-',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            link: '/admin/pages',
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-frank font-bold text-barby-gold mb-2">לוח בקרה</h1>
                <p className="text-barby-cream/60">ברוכים הבאים למערכת הניהול של בארבי</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Link key={stat.label} to={stat.link}>
                        <Card hover className="h-full">
                            <CardContent className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-barby-gold/10 flex items-center justify-center text-barby-gold">
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-barby-cream">
                                        {isLoadingShows || isLoadingPages ? <Skeleton className="w-8 h-8" /> : stat.value}
                                    </div>
                                    <div className="text-sm text-barby-cream/60">{stat.label}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>הופעות אחרונות</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingShows ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : (
                            <ul className="divide-y divide-barby-gold/10">
                                {showsData?.items?.slice(0, 5).map((show) => (
                                    <li key={show.id}>
                                        <Link
                                            to={`/admin/shows/${show.id}`}
                                            className="flex items-center justify-between py-3 hover:text-barby-gold transition-colors"
                                        >
                                            <span className="truncate">{show.title}</span>
                                            <span className="text-xs text-barby-cream/40">
                                                {new Date(show.dateISO).toLocaleDateString('he-IL')}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Link
                            to="/admin/shows/new"
                            className="block mt-4 text-center text-barby-gold hover:text-barby-gold-light text-sm transition-colors"
                        >
                            + הוספת הופעה חדשה
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>עמודים</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingPages ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : (
                            <ul className="divide-y divide-barby-gold/10">
                                {pagesData?.items?.slice(0, 5).map((page) => (
                                    <li key={page.key}>
                                        <Link
                                            to={`/admin/pages/${page.key}`}
                                            className="flex items-center justify-between py-3 hover:text-barby-gold transition-colors"
                                        >
                                            <span className="truncate">{page.title}</span>
                                            <span className="text-xs text-barby-cream/60">
                                                {page.key}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Link
                            to="/admin/pages/new"
                            className="block mt-4 text-center text-barby-gold hover:text-barby-gold-light text-sm transition-colors"
                        >
                            + הוספת עמוד חדש
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Admin-only section */}
            {isAdmin && (
                <Card>
                    <CardHeader>
                        <CardTitle>פעולות מהירות למנהל</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/admin/users"
                                className="px-4 py-2 bg-barby-gold/10 text-barby-gold hover:bg-barby-gold/20 transition-colors"
                            >
                                ניהול משתמשים
                            </Link>
                            <Link
                                to="/admin/settings"
                                className="px-4 py-2 bg-barby-gold/10 text-barby-gold hover:bg-barby-gold/20 transition-colors"
                            >
                                הגדרות האתר
                            </Link>
                            <Link
                                to="/admin/audit"
                                className="px-4 py-2 bg-barby-gold/10 text-barby-gold hover:bg-barby-gold/20 transition-colors"
                            >
                                יומן פעולות
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
