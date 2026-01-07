import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, Modal, PageSkeleton } from '@/components/common'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiMove } from 'react-icons/fi'
import type { FAQItem } from '@/types'

interface FAQFormData {
    question: string
    answer: string
    category: string
    isActive: boolean
}

function FAQFormModal({
    isOpen,
    onClose,
    faq,
    onSubmit,
    isLoading,
}: {
    isOpen: boolean
    onClose: () => void
    faq?: FAQItem | null
    onSubmit: (data: FAQFormData) => void
    isLoading: boolean
}) {
    const [formData, setFormData] = useState<FAQFormData>({
        question: faq?.question || '',
        answer: faq?.answer || '',
        category: faq?.category || 'כללי',
        isActive: faq?.isActive ?? true,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={faq ? 'עריכת שאלה' : 'הוספת שאלה חדשה'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="שאלה"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    required
                />
                <Textarea
                    label="תשובה"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    rows={5}
                    required
                />
                <Input
                    label="קטגוריה"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="כללי"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-barby-gold/30 bg-barby-darker text-barby-gold focus:ring-barby-gold"
                    />
                    <span className="text-barby-cream">פעיל (מוצג באתר)</span>
                </label>
                <div className="flex gap-3 pt-4">
                    <Button type="submit" isLoading={isLoading}>
                        {faq ? 'עדכן' : 'הוסף'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        ביטול
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

export function AdminFAQ() {
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const { data: faqs, isLoading } = useQuery({
        queryKey: queryKeys.admin.faq.list,
        queryFn: adminApi.getFAQs,
    })

    const createMutation = useMutation({
        mutationFn: adminApi.createFAQ,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.faq.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.faq.all })
            toast.success('השאלה נוספה בהצלחה')
            setIsModalOpen(false)
        },
        onError: () => {
            toast.error('שגיאה בהוספת השאלה')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<FAQFormData> }) =>
            adminApi.updateFAQ(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.faq.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.faq.all })
            toast.success('השאלה עודכנה בהצלחה')
            setIsModalOpen(false)
            setEditingFAQ(null)
        },
        onError: () => {
            toast.error('שגיאה בעדכון השאלה')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: adminApi.deleteFAQ,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.faq.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.faq.all })
            toast.success('השאלה נמחקה בהצלחה')
            setDeleteConfirm(null)
        },
        onError: () => {
            toast.error('שגיאה במחיקת השאלה')
        },
    })

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            adminApi.updateFAQ(id, { isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.faq.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.faq.all })
        },
    })

    const handleOpenCreate = () => {
        setEditingFAQ(null)
        setIsModalOpen(true)
    }

    const handleOpenEdit = (faq: FAQItem) => {
        setEditingFAQ(faq)
        setIsModalOpen(true)
    }

    const handleSubmit = (data: FAQFormData) => {
        if (editingFAQ) {
            updateMutation.mutate({ id: editingFAQ.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleToggleActive = (faq: FAQItem) => {
        toggleActiveMutation.mutate({ id: faq.id, isActive: !faq.isActive })
    }

    if (isLoading) {
        return <PageSkeleton />
    }

    // Group FAQs by category
    const groupedFAQs = (faqs || []).reduce((acc, faq) => {
        const category = faq.category || 'כללי'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(faq)
        return acc
    }, {} as Record<string, FAQItem[]>)

    const categories = Object.keys(groupedFAQs).sort()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-frank font-bold text-barby-gold">שאלות נפוצות</h1>
                    <p className="text-barby-cream/60">ניהול שאלות ותשובות באתר</p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <FiPlus className="w-4 h-4 ml-2" />
                    הוסף שאלה
                </Button>
            </div>

            {/* FAQ List */}
            {categories.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-barby-cream/60">אין שאלות עדיין</p>
                        <Button onClick={handleOpenCreate} className="mt-4">
                            <FiPlus className="w-4 h-4 ml-2" />
                            הוסף שאלה ראשונה
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {categories.map((category) => (
                        <Card key={category}>
                            <CardHeader>
                                <CardTitle>{category}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {groupedFAQs[category].map((faq) => (
                                    <div
                                        key={faq.id}
                                        className={`flex items-start gap-4 p-4 rounded-lg border ${faq.isActive
                                            ? 'border-barby-gold/20 bg-barby-darker/30'
                                            : 'border-barby-cream/10 bg-barby-darker/10 opacity-60'
                                            }`}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            <FiMove className="w-4 h-4 text-barby-cream/40 cursor-grab" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-barby-cream mb-1">{faq.question}</h3>
                                            <p className="text-barby-cream/60 text-sm line-clamp-2">{faq.answer}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleToggleActive(faq)}
                                                className={`p-2 rounded-lg transition-colors ${faq.isActive
                                                    ? 'text-green-400 hover:bg-green-400/10'
                                                    : 'text-barby-cream/40 hover:bg-barby-cream/10'
                                                    }`}
                                                title={faq.isActive ? 'הסתר מהאתר' : 'הצג באתר'}
                                            >
                                                {faq.isActive ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleOpenEdit(faq)}
                                                className="p-2 rounded-lg text-barby-gold hover:bg-barby-gold/10 transition-colors"
                                                title="ערוך"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(faq.id)}
                                                className="p-2 rounded-lg text-barby-red hover:bg-barby-red/10 transition-colors"
                                                title="מחק"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <FAQFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setEditingFAQ(null)
                }}
                faq={editingFAQ}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="מחיקת שאלה"
            >
                <p className="text-barby-cream/80 mb-6">
                    האם אתה בטוח שברצונך למחוק את השאלה הזו? פעולה זו לא ניתנת לביטול.
                </p>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
                        isLoading={deleteMutation.isPending}
                        className="!bg-barby-red !border-barby-red hover:!bg-barby-red/80"
                    >
                        מחק
                    </Button>
                    <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                        ביטול
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
