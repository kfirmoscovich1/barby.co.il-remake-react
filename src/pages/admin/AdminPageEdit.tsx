import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updatePageSchema } from '@/lib/validation'
import type { Page } from '@/types'
import { adminApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { Button, Input, PageSkeleton } from '@/components/common'
import { RichTextEditor } from '@/components/feature/RichTextEditor'
import toast from 'react-hot-toast'
import { FiUpload, FiFile, FiTrash2 } from 'react-icons/fi'

type PageFormInput = {
    title: string
    contentRichText: string
    pdfMediaId?: string | null
}

const PAGE_LABELS: Record<Page['key'], string> = {
    'about': 'אודות',
    'terms': 'תנאי שימוש',
    'accessibility': 'הצהרת נגישות',
    'privacy': 'מדיניות פרטיות',
    'contact': 'צור קשר',
    'mailing-list': 'רשימת תפוצה',
}

export function AdminPageEdit() {
    const { id } = useParams<{ id: string }>() // id is the page key
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [pdfFileName, setPdfFileName] = useState<string | null>(null)
    const [existingPdfId, setExistingPdfId] = useState<string | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: queryKeys.admin.pages.detail(id!),
        queryFn: () => adminApi.getPage(id!),
        enabled: !!id,
    })

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<PageFormInput>({
        resolver: zodResolver(updatePageSchema),
        defaultValues: {
            title: '',
            contentRichText: '',
        },
    })

    const contentRichText = watch('contentRichText')

    // Reset form when data loads
    useEffect(() => {
        if (data?.page) {
            const page = data.page
            reset({
                title: page.title || PAGE_LABELS[page.key] || page.key,
                contentRichText: page.contentRichText || '',
                pdfMediaId: page.pdfMediaId,
            })
            if (page.pdfMediaId) {
                setExistingPdfId(page.pdfMediaId)
                setPdfFileName('קובץ PDF קיים')
            }
        }
    }, [data, reset])

    const handlePdfChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('יש להעלות קובץ PDF בלבד')
                return
            }
            setPdfFile(file)
            setPdfFileName(file.name)
            setExistingPdfId(null)
        }
    }, [])

    const removePdf = useCallback(() => {
        setPdfFile(null)
        setPdfFileName(null)
        setExistingPdfId(null)
        setValue('pdfMediaId', null)
    }, [setValue])

    const updateMutation = useMutation({
        mutationFn: async (formData: PageFormInput) => {
            let pdfMediaId: string | null | undefined = existingPdfId

            if (pdfFile) {
                // Upload PDF first
                const uploadResult = await adminApi.uploadMedia(pdfFile)
                console.log('Upload result:', uploadResult)
                pdfMediaId = uploadResult.media?.id || null
            }

            console.log('Sending pdfMediaId:', pdfMediaId)

            return adminApi.updatePage(id!, {
                title: formData.title,
                contentRichText: formData.contentRichText,
                pdfMediaId: pdfMediaId ?? undefined,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.pages.all })
            toast.success('העמוד עודכן בהצלחה')
        },
        onError: () => {
            toast.error('שגיאה בעדכון העמוד')
        },
    })

    const onSubmit = (formData: PageFormInput) => {
        updateMutation.mutate(formData)
    }

    if (isLoading) {
        return <PageSkeleton />
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-frank font-bold text-barby-gold">
                    עריכת עמוד: {PAGE_LABELS[id as Page['key']] || id}
                </h1>
                <p className="text-barby-cream/60">
                    עריכת תוכן העמוד
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                    label="כותרת"
                    error={errors.title?.message}
                    {...register('title')}
                />

                <div>
                    <label className="block text-sm font-medium text-barby-cream mb-2">
                        תוכן
                    </label>
                    <RichTextEditor
                        content={contentRichText}
                        onChange={(html: string) => setValue('contentRichText', html)}
                    />
                    {errors.contentRichText && (
                        <p className="mt-1 text-sm text-barby-red">{errors.contentRichText.message}</p>
                    )}
                </div>

                {/* PDF Upload */}
                <div>
                    <label className="block text-sm font-medium text-barby-cream mb-2">
                        קובץ PDF (אופציונלי)
                    </label>
                    <p className="text-barby-cream/50 text-sm mb-3">
                        העלו קובץ PDF להצגה בעמוד (למשל: מדיניות פרטיות, תנאי שימוש)
                    </p>

                    {pdfFileName ? (
                        <div className="flex items-center gap-3 p-4 bg-barby-darker/50 rounded-lg border border-barby-gold/20">
                            <FiFile className="w-8 h-8 text-barby-gold" />
                            <div className="flex-1">
                                <p className="text-barby-cream font-medium">{pdfFileName}</p>
                                <p className="text-barby-cream/50 text-sm">
                                    {pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : 'קובץ קיים במערכת'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={removePdf}
                                className="text-barby-red/70 hover:text-barby-red p-2"
                                title="הסר PDF"
                            >
                                <FiTrash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center h-32 cursor-pointer border-2 border-dashed border-barby-gold/30 hover:border-barby-gold/50 transition-colors rounded-lg bg-barby-darker/30">
                            <FiUpload className="w-8 h-8 text-barby-gold/50 mb-2" />
                            <span className="text-barby-cream/60">לחצו להעלאת קובץ PDF</span>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handlePdfChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                <div className="flex gap-3 pt-4">
                    <Button
                        type="submit"
                        isLoading={updateMutation.isPending}
                    >
                        שמור שינויים
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate('/admin/pages')}
                    >
                        ביטול
                    </Button>
                </div>
            </form>
        </div>
    )
}
