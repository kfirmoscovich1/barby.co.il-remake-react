import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createShowSchema, type CreateShowInput } from '@/lib/validation'
import { adminApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { Button, Input, Select, PageSkeleton } from '@/components/common'
import { RichTextEditor } from '@/components/feature'
import toast from 'react-hot-toast'

export function AdminShowEdit() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const isNew = !id

    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: queryKeys.admin.shows.detail(id!),
        queryFn: () => adminApi.getShow(id!),
        enabled: !!id,
    })

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateShowInput>({
        resolver: zodResolver(createShowSchema),
        defaultValues: {
            title: '',
            description: '<p></p>',
            dateISO: '',
            doorsTime: '',
            venueName: 'בארבי',
            venueAddress: 'דרך קיבוץ גלויות 52, תל אביב',
            status: 'available',
            ticketTiers: [{ label: 'כניסה רגילה', price: 0, currency: 'ILS', quantity: 0 }],
            tags: [],
            featured: false,
            published: true,
            archived: false,
            isStanding: true,
            is360: false,
            isInternational: false,
            publishDelay: '',
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'ticketTiers',
    })

    // Reset form when data loads
    useEffect(() => {
        if (data?.show) {
            const show = data.show
            reset({
                title: show.title,
                slug: show.slug,
                description: show.description || '',
                dateISO: show.dateISO,
                doorsTime: show.doorsTime || '',
                venueName: show.venueName,
                venueAddress: show.venueAddress,
                status: show.status,
                isStanding: show.isStanding !== false, // default true
                is360: show.is360 || false,
                isInternational: (show as any).isInternational || false,
                ticketTiers: show.ticketTiers.length > 0
                    ? show.ticketTiers.map(t => ({ ...t, quantity: (t as any).quantity || 0 }))
                    : [{ label: 'כניסה רגילה', price: 0, currency: 'ILS', quantity: 0 }],
                tags: show.tags,
                featured: show.featured,
                published: show.published !== false, // default true
                archived: show.archived,
                publishDelay: (show as any).publishDelay || '',
            })
            // Handle image preview if there's an imageMediaId
            // For now, we'll skip image preview from API
        }
    }, [data, reset])

    const createMutation = useMutation({
        mutationFn: async (formData: CreateShowInput) => {
            let imageMediaId: string | undefined

            if (imageFile) {
                // Upload image first
                const uploadResult = await adminApi.uploadMedia(imageFile)
                imageMediaId = uploadResult.media?.id
            }

            return adminApi.createShow({
                ...formData,
                imageMediaId,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.shows.all })
            toast.success('ההופעה נוצרה בהצלחה')
            navigate('/admin/shows')
        },
        onError: () => {
            toast.error('שגיאה ביצירת ההופעה')
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (formData: CreateShowInput) => {
            let imageMediaId: string | undefined = data?.show?.imageMediaId

            if (imageFile) {
                // Upload image first
                const uploadResult = await adminApi.uploadMedia(imageFile)
                imageMediaId = uploadResult.media?.id
            }

            return adminApi.updateShow(id!, {
                ...formData,
                imageMediaId,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.shows.all })
            toast.success('ההופעה עודכנה בהצלחה')
        },
        onError: () => {
            toast.error('שגיאה בעדכון ההופעה')
        },
    })

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [])

    const onSubmit = (data: CreateShowInput) => {
        if (isNew) {
            createMutation.mutate(data)
        } else {
            updateMutation.mutate(data)
        }
    }

    if (!isNew && isLoading) {
        return <PageSkeleton />
    }

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h1 className="text-2xl font-frank font-bold text-barby-gold">
                    {isNew ? 'הופעה חדשה' : 'עריכת הופעה'}
                </h1>
                <p className="text-barby-cream/60">
                    {isNew ? 'צרו הופעה חדשה במערכת' : `עריכת "${data?.show?.title}"`}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Image upload */}
                <div>
                    <label className="block text-sm font-medium text-barby-cream mb-2">תמונה</label>
                    <div className="card-vintage p-4">
                        {imagePreview ? (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full max-h-64 object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null)
                                        setImageFile(null)
                                    }}
                                    className="absolute top-2 left-2 p-1 bg-barby-red text-white rounded-full"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-48 cursor-pointer border-2 border-dashed border-barby-gold/30 hover:border-barby-gold/50 transition-colors">
                                <svg className="w-12 h-12 text-barby-gold/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-barby-cream/60">לחצו להעלאת תמונה</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </div>

                <Input
                    label="כותרת"
                    error={errors.title?.message}
                    {...register('title')}
                />

                <Input
                    label="Slug (אופציונלי)"
                    placeholder="my-show-name"
                    error={errors.slug?.message}
                    {...register('slug')}
                />

                <div>
                    <label className="block text-sm font-medium text-barby-cream mb-2">תיאור</label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <RichTextEditor
                                content={field.value || '<p></p>'}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    {errors.description?.message && (
                        <p className="text-barby-red text-sm mt-1">{errors.description.message}</p>
                    )}
                    <p className="text-barby-cream/50 text-sm mt-1">
                        השתמשו בעורך להוספת פסקאות, כותרות וטקסט מעוצב
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="תאריך ושעה (ISO format)"
                        type="datetime-local"
                        error={errors.dateISO?.message}
                        {...register('dateISO', {
                            setValueAs: (v) => v ? new Date(v).toISOString() : '',
                        })}
                    />

                    <Input
                        label="פתיחת דלתות (אופציונלי)"
                        placeholder="20:00"
                        error={errors.doorsTime?.message}
                        {...register('doorsTime')}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="שם המקום"
                        error={errors.venueName?.message}
                        {...register('venueName')}
                    />

                    <Input
                        label="כתובת"
                        error={errors.venueAddress?.message}
                        {...register('venueAddress')}
                    />
                </div>

                {/* Ticket Tiers */}
                <div>
                    <label className="block text-sm font-medium text-barby-cream mb-2">סוגי כרטיסים</label>
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="card-vintage p-4 flex gap-4 items-end">
                                <div className="flex-1">
                                    <Input
                                        label="שם"
                                        error={errors.ticketTiers?.[index]?.label?.message}
                                        {...register(`ticketTiers.${index}.label`)}
                                    />
                                </div>
                                <div className="w-28">
                                    <Input
                                        label="מחיר (₪)"
                                        type="number"
                                        error={errors.ticketTiers?.[index]?.price?.message}
                                        {...register(`ticketTiers.${index}.price`, { valueAsNumber: true })}
                                    />
                                </div>
                                <div className="w-28">
                                    <Input
                                        label="כמות"
                                        type="number"
                                        placeholder="0 = ללא הגבלה"
                                        error={errors.ticketTiers?.[index]?.quantity?.message}
                                        {...register(`ticketTiers.${index}.quantity`, { valueAsNumber: true })}
                                    />
                                </div>
                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                    >
                                        ✕
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ label: '', price: 0, currency: 'ILS', quantity: 0 })}
                        >
                            + הוסף סוג כרטיס
                        </Button>
                    </div>
                </div>

                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label="סטטוס כרטיסים"
                            options={[
                                { value: 'available', label: 'זמין' },
                                { value: 'few_left', label: 'כרטיסים בודדים' },
                                { value: 'sold_out', label: 'אזל' },
                                { value: 'closed', label: 'סגור' },
                            ]}
                            {...field}
                        />
                    )}
                />

                {/* Show Type Options */}
                <div className="card-vintage p-4">
                    <label className="block text-sm font-medium text-barby-cream mb-3">סוג ההופעה</label>
                    <div className="flex flex-wrap items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-barby-gold"
                                {...register('isStanding')}
                            />
                            <span className="text-barby-cream">עמידה</span>
                            <span className="text-barby-cream/50 text-sm">(ברירת מחדל)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-barby-gold"
                                checked={!watch('isStanding')}
                                onChange={(e) => setValue('isStanding', !e.target.checked)}
                            />
                            <span className="text-barby-cream">ישיבה</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-barby-gold"
                                {...register('is360')}
                            />
                            <span className="text-barby-cream">360°</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-barby-gold"
                                {...register('isInternational')}
                            />
                            <span className="text-barby-cream">אמן בינלאומי</span>
                        </label>
                    </div>
                </div>

                {/* Publish Delay */}
                <div className="card-vintage p-4">
                    <Input
                        label="פרסום מתוזמן (אופציונלי)"
                        type="datetime-local"
                        error={errors.publishDelay?.message}
                        {...register('publishDelay')}
                    />
                    <p className="text-barby-cream/50 text-sm mt-1">
                        השאירו ריק לפרסום מיידי
                    </p>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button
                        type="submit"
                        isLoading={createMutation.isPending || updateMutation.isPending}
                    >
                        {isNew ? 'צור הופעה' : 'שמור שינויים'}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate('/admin/shows')}
                    >
                        ביטול
                    </Button>
                </div>
            </form>
        </div>
    )
}
