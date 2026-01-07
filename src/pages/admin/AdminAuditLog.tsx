import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { Button, Badge, Skeleton } from '@/components/common'
import { formatDate } from '@/utils'
import type { AuditLog } from '@/types'

const ACTION_LABELS: Record<AuditLog['action'], string> = {
    create: 'יצירה',
    update: 'עדכון',
    delete: 'מחיקה',
    login: 'התחברות',
    logout: 'התנתקות',
}

const ENTITY_LABELS: Record<AuditLog['entityType'], string> = {
    user: 'משתמש',
    show: 'הופעה',
    page: 'עמוד',
    media: 'מדיה',
    'site-settings': 'הגדרות',
}

export function AdminAuditLog() {
    const [page, setPage] = useState(1)
    const limit = 50

    const { data, isLoading } = useQuery({
        queryKey: queryKeys.admin.auditLogs.list({ page, limit }),
        queryFn: () => adminApi.getAuditLogs({ page, limit }),
    })

    const logs = data?.items || []
    const totalPages = data?.totalPages || 1
    const total = data?.total || 0

    const getActionBadge = (action: AuditLog['action']) => {
        switch (action) {
            case 'create':
                return <Badge variant="green">{ACTION_LABELS[action]}</Badge>
            case 'update':
                return <Badge variant="gold">{ACTION_LABELS[action]}</Badge>
            case 'delete':
                return <Badge variant="red">{ACTION_LABELS[action]}</Badge>
            case 'login':
            case 'logout':
                return <Badge variant="gray">{ACTION_LABELS[action]}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-frank font-bold text-barby-gold">יומן פעילות</h1>
                <p className="text-barby-cream/60">מעקב אחר פעולות במערכת</p>
            </div>

            {/* Table */}
            <div className="card-vintage overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-barby-dark">
                            <tr>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">תאריך</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">משתמש</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">פעולה</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">סוג</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">פרטים</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-barby-gold/10">
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="p-4"><Skeleton className="h-6 w-28" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-32" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-16" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-16" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-40" /></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-barby-cream/60">
                                        לא נמצאו רשומות
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-barby-gold/5 transition-colors">
                                        <td className="p-4 text-barby-cream/70 text-sm whitespace-nowrap">
                                            {formatDate(log.createdAt.toString(), {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="p-4 text-barby-cream">
                                            {log.actorEmail}
                                        </td>
                                        <td className="p-4">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="p-4 text-barby-cream/70">
                                            {ENTITY_LABELS[log.entityType]}
                                        </td>
                                        <td className="p-4 text-barby-cream/60 text-sm max-w-xs truncate">
                                            {log.diffSummary || '-'}
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
                            מציג {logs.length} מתוך {total}
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
        </div>
    )
}
