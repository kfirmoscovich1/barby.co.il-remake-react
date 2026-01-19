import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { adminApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { Button, Badge, Modal, Skeleton, Input, Select } from '@/components/common'
import toast from 'react-hot-toast'
import type { UserPublic } from '@/types'

interface CreateUserForm {
    name: string
    email: string
    password: string
    role: 'admin' | 'editor'
}

interface EditUserForm {
    name?: string
    email?: string
    password?: string
    role?: 'admin' | 'editor'
}

export function AdminUsers() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [createModal, setCreateModal] = useState(false)
    const [editModal, setEditModal] = useState<UserPublic | null>(null)
    const [deleteModal, setDeleteModal] = useState<UserPublic | null>(null)
    const limit = 20

    const { data, isLoading } = useQuery({
        queryKey: queryKeys.admin.users.list({ page, limit }),
        queryFn: () => adminApi.getUsers({ page, limit }),
    })

    const createForm = useForm<CreateUserForm>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: 'editor',
        },
    })

    const editForm = useForm<EditUserForm>()

    const createMutation = useMutation({
        mutationFn: (data: CreateUserForm) => adminApi.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all })
            toast.success('המשתמש נוצר בהצלחה')
            setCreateModal(false)
            createForm.reset()
        },
        onError: () => {
            toast.error('שגיאה ביצירת המשתמש')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: EditUserForm }) =>
            adminApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all })
            toast.success('המשתמש עודכן בהצלחה')
            setEditModal(null)
        },
        onError: () => {
            toast.error('שגיאה בעדכון המשתמש')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all })
            toast.success('המשתמש נמחק בהצלחה')
            setDeleteModal(null)
        },
        onError: () => {
            toast.error('שגיאה במחיקת המשתמש')
        },
    })

    const handleOpenEdit = (user: UserPublic) => {
        editForm.reset({
            name: user.name,
            email: user.email,
            role: user.role,
        })
        setEditModal(user)
    }

    const handleUpdateSubmit = (data: EditUserForm) => {
        if (!editModal) return
        const updateData: EditUserForm = {}
        if (data.name && data.name !== editModal.name) updateData.name = data.name
        if (data.email && data.email !== editModal.email) updateData.email = data.email
        if (data.password) updateData.password = data.password
        if (data.role && data.role !== editModal.role) updateData.role = data.role

        updateMutation.mutate({ id: editModal.id, data: updateData })
    }

    const users = data?.items || []
    const totalPages = data?.totalPages || 1
    const total = data?.total || 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-frank font-bold text-barby-gold">משתמשים</h1>
                    <p className="text-barby-cream/60">ניהול משתמשי המערכת</p>
                </div>
                <Button onClick={() => setCreateModal(true)}>+ משתמש חדש</Button>
            </div>

            {/* Table */}
            <div className="card-vintage overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-barby-dark">
                            <tr>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">שם</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">אימייל</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">תפקיד</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">תאריך יצירה</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-barby-gold/10">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="p-4"><Skeleton className="h-6 w-32" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-40" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-16" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-20" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-24" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-barby-cream/60">
                                        לא נמצאו משתמשים
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-barby-gold/5 transition-colors">
                                        <td className="p-4 font-medium text-barby-cream">{user.name || '-'}</td>
                                        <td className="p-4 text-barby-cream/70">{user.email}</td>
                                        <td className="p-4">
                                            <Badge variant={user.role === 'admin' ? 'gold' : 'gray'}>
                                                {user.role === 'admin' ? 'מנהל' : 'עורך'}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-barby-cream/60 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString('he-IL')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(user)}
                                                    className="p-2 text-barby-cream/60 hover:text-barby-gold transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal(user)}
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
                            מציג {users.length} מתוך {total}
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

            {/* Create Modal */}
            <Modal
                isOpen={createModal}
                onClose={() => setCreateModal(false)}
                title="משתמש חדש"
            >
                <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                    <Input
                        label="שם"
                        {...createForm.register('name')}
                    />
                    <Input
                        label="אימייל"
                        type="email"
                        {...createForm.register('email', { required: true })}
                    />
                    <Input
                        label="סיסמה"
                        type="password"
                        {...createForm.register('password', { required: true, minLength: 8 })}
                    />
                    <Select
                        label="תפקיד"
                        options={[
                            { value: 'editor', label: 'עורך' },
                            { value: 'admin', label: 'מנהל' },
                        ]}
                        {...createForm.register('role')}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" isLoading={createMutation.isPending}>
                            צור משתמש
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setCreateModal(false)}>
                            ביטול
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editModal}
                onClose={() => setEditModal(null)}
                title="עריכת משתמש"
            >
                <form onSubmit={editForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
                    <Input
                        label="שם"
                        {...editForm.register('name')}
                    />
                    <Input
                        label="אימייל"
                        type="email"
                        {...editForm.register('email')}
                    />
                    <Input
                        label="סיסמה חדשה (ריק = ללא שינוי)"
                        type="password"
                        {...editForm.register('password')}
                    />
                    <Select
                        label="תפקיד"
                        options={[
                            { value: 'editor', label: 'עורך' },
                            { value: 'admin', label: 'מנהל' },
                        ]}
                        {...editForm.register('role')}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" isLoading={updateMutation.isPending}>
                            שמור שינויים
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setEditModal(null)}>
                            ביטול
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete modal */}
            <Modal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="מחיקת משתמש"
                size="sm"
            >
                <p className="text-barby-cream/70 mb-6">
                    האם אתה בטוח שברצונך למחוק את המשתמש "{deleteModal?.email}"?
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
