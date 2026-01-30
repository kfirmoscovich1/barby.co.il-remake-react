import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { Button, Modal, Skeleton } from '@/components/common'
import toast from 'react-hot-toast'
import type { Media } from '@/types'

export function AdminMedia() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [deleteModal, setDeleteModal] = useState<Media | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const limit = 12

    const { data, isLoading } = useQuery({
        queryKey: queryKeys.admin.media.list({ page, limit }),
        queryFn: () => adminApi.getMedia({ page, limit }),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminApi.deleteMedia(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.media.all })
            toast.success('הקובץ נמחק בהצלחה')
            setDeleteModal(null)
        },
        onError: () => {
            toast.error('שגיאה במחיקת הקובץ')
        },
    })

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        try {
            for (const file of files) {
                await adminApi.uploadMedia(file)
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.media.all })
            toast.success('הקבצים הועלו בהצלחה')
        } catch {
            toast.error('שגיאה בהעלאת הקבצים')
        } finally {
            setIsUploading(false)
        }
    }

    const mediaItems = data?.items || []
    const totalPages = data?.totalPages || 1
    const total = data?.total || 0

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-frank font-bold text-barby-gold">מדיה</h1>
                    <p className="text-barby-cream/60">ניהול קבצי מדיה</p>
                </div>
                <label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                    />
                    <Button as="span" isLoading={isUploading}>
                        {isUploading ? 'מעלה...' : '+ העלאת קובץ'}
                    </Button>
                </label>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="card-vintage p-2">
                            <Skeleton className="aspect-square w-full" />
                            <Skeleton className="h-4 w-24 mt-2" />
                        </div>
                    ))
                ) : mediaItems.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-barby-cream/60 card-vintage">
                        לא נמצאו קבצי מדיה
                    </div>
                ) : (
                    mediaItems.map((item) => (
                        <div key={item.id} className="card-vintage p-2 group">
                            <div className="aspect-square bg-barby-dark overflow-hidden">
                                <img
                                    src={`/api/media/${item.id}/thumbnail`}
                                    alt={item.originalName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-barby-cream truncate">{item.originalName}</p>
                                    <p className="text-xs text-barby-cream/50">{formatFileSize(item.sizeBytes)}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={`/api/media/${item.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 text-barby-cream/60 hover:text-barby-gold transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                    <button
                                        onClick={() => setDeleteModal(item)}
                                        className="p-1 text-barby-cream/60 hover:text-barby-red transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-barby-cream/60">
                        מציג {mediaItems.length} מתוך {total}
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

            {/* Delete modal */}
            <Modal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="מחיקת קובץ"
                size="sm"
            >
                <p className="text-barby-cream/70 mb-6">
                    האם אתה בטוח שברצונך למחוק את הקובץ "{deleteModal?.originalName}"?
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
