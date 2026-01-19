import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { Button, Badge, Modal, Skeleton } from '@/components/common'
import { formatDate, formatPrice } from '@/utils'
import toast from 'react-hot-toast'
import type { Show } from '@/types'

export function AdminShows() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [deleteModal, setDeleteModal] = useState<Show | null>(null)
    const limit = 10

    const { data, isLoading } = useQuery({
        queryKey: queryKeys.admin.shows.list({ page, limit, search }),
        queryFn: () => adminApi.getShows({ page, limit, search: search || undefined }),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminApi.deleteShow(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.shows.all })
            toast.success('ההופעה נמחקה בהצלחה')
            setDeleteModal(null)
        },
        onError: () => {
            toast.error('שגיאה במחיקת ההופעה')
        },
    })

    const shows = data?.items || []
    const totalPages = data?.totalPages || 1
    const total = data?.total || 0

    const getStatusBadge = (status: Show['status']) => {
        switch (status) {
            case 'available':
                return <Badge variant="green">זמין</Badge>
            case 'sold_out':
                return <Badge variant="red">אזל</Badge>
            case 'closed':
                return <Badge variant="gray">סגור</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-frank font-bold text-barby-gold">הופעות</h1>
                    <p className="text-barby-cream/60">ניהול הופעות ואירועים</p>
                </div>
                <Link to="/admin/shows/new">
                    <Button>+ הופעה חדשה</Button>
                </Link>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="חיפוש הופעות..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                    }}
                    className="input-vintage flex-1 max-w-md"
                />
            </div>

            {/* Table */}
            <div className="card-vintage overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-barby-dark">
                            <tr>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">כותרת</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">תאריך</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">מחיר</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">סטטוס</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-barby-gold/10">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="p-4"><Skeleton className="h-6 w-48" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-24" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-16" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-20" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-24" /></td>
                                    </tr>
                                ))
                            ) : shows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-barby-cream/60">
                                        לא נמצאו הופעות
                                    </td>
                                </tr>
                            ) : (
                                shows.map((show) => (
                                    <tr key={show.id} className="hover:bg-barby-gold/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <div className="font-medium text-barby-cream">{show.title}</div>
                                                    {show.featured && <Badge variant="gold" className="mt-1">מומלץ</Badge>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-barby-cream/70">
                                            {formatDate(show.dateISO, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-4 text-barby-cream/70">
                                            {show.ticketTiers[0] ? formatPrice(show.ticketTiers[0].price) : '-'}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(show.status)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/admin/shows/${show.id}`}
                                                    className="p-2 text-barby-cream/60 hover:text-barby-gold transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteModal(show)}
                                                    className="p-2 text-barby-cream/60 hover:text-barby-red transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-barby-gold/10">
                        <span className="text-sm text-barby-cream/60">
                            מציג {shows.length} מתוך {total}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                הקודם
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                הבא
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete modal */}
            <Modal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="מחיקת הופעה"
                size="sm"
            >
                <p className="text-barby-cream/70 mb-6">
                    האם אתה בטוח שברצונך למחוק את ההופעה "{deleteModal?.title}"?
                    פעולה זו אינה ניתנת לביטול.
                </p>
                <div className="flex gap-3">
                    <Button
                        variant="destructive"
                        onClick={() => deleteModal && deleteMutation.mutate(deleteModal.id)}
                        isLoading={deleteMutation.isPending}
                    >
                        מחק
                    </Button>
                    <Button variant="ghost" onClick={() => setDeleteModal(null)}>
                        ביטול
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
