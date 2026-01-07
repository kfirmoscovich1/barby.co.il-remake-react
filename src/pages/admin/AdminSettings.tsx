import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { adminApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { Button, Input, Textarea, PageSkeleton, Card, CardHeader, CardTitle, CardContent, Select } from '@/components/common'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiMove, FiEdit2, FiCheck, FiX } from 'react-icons/fi'

interface SocialLink {
    platform: string
    url: string
}

interface SettingsFormData {
    footer: {
        address: string
        phone: string
        email: string
        copyrightText: string
        googleMapsUrl: string
        wazeUrl: string
    }
}

const SOCIAL_PLATFORMS = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter / X' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'whatsapp', label: 'WhatsApp' },
]

export function AdminSettings() {
    const queryClient = useQueryClient()
    const [marqueeItems, setMarqueeItems] = useState<string[]>([])
    const [newMarqueeItem, setNewMarqueeItem] = useState('')
    const [editingMarqueeIndex, setEditingMarqueeIndex] = useState<number | null>(null)
    const [editingMarqueeValue, setEditingMarqueeValue] = useState('')
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
    const [newSocialPlatform, setNewSocialPlatform] = useState('')
    const [newSocialUrl, setNewSocialUrl] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: queryKeys.admin.settings,
        queryFn: adminApi.getSettings,
    })

    const {
        register,
        handleSubmit,
        reset,
    } = useForm<SettingsFormData>({
        defaultValues: {
            footer: {
                address: '',
                phone: '',
                email: '',
                copyrightText: '',
                googleMapsUrl: '',
                wazeUrl: '',
            },
        },
    })

    useEffect(() => {
        if (data?.settings) {
            reset({
                footer: {
                    address: data.settings.footer?.address || '',
                    phone: data.settings.footer?.phone || '',
                    email: data.settings.footer?.email || '',
                    copyrightText: data.settings.footer?.copyrightText || '',
                    googleMapsUrl: data.settings.footer?.googleMapsUrl || '',
                    wazeUrl: data.settings.footer?.wazeUrl || '',
                },
            })
            setMarqueeItems(data.settings.marqueeItems || [])
            setSocialLinks(data.settings.footer?.socialLinks || [])
        }
    }, [data, reset])

    const updateMutation = useMutation({
        mutationFn: (formData: SettingsFormData) => adminApi.updateSettings({
            footer: {
                ...data?.settings.footer,
                address: formData.footer.address,
                phone: formData.footer.phone,
                email: formData.footer.email,
                copyrightText: formData.footer.copyrightText,
                googleMapsUrl: formData.footer.googleMapsUrl || undefined,
                wazeUrl: formData.footer.wazeUrl || undefined,
                socialLinks: socialLinks,
            },
            marqueeItems,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings })
            queryClient.invalidateQueries({ queryKey: queryKeys.settings.public })
            toast.success('ההגדרות עודכנו בהצלחה')
        },
        onError: () => {
            toast.error('שגיאה בעדכון ההגדרות')
        },
    })

    const addMarqueeItem = () => {
        if (newMarqueeItem.trim()) {
            setMarqueeItems([...marqueeItems, newMarqueeItem.trim()])
            setNewMarqueeItem('')
        }
    }

    const removeMarqueeItem = (index: number) => {
        setMarqueeItems(marqueeItems.filter((_, i) => i !== index))
    }

    const moveMarqueeItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...marqueeItems]
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex >= 0 && newIndex < newItems.length) {
            [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]]
            setMarqueeItems(newItems)
        }
    }

    const startEditingMarquee = (index: number) => {
        setEditingMarqueeIndex(index)
        setEditingMarqueeValue(marqueeItems[index])
    }

    const saveMarqueeEdit = () => {
        if (editingMarqueeIndex !== null && editingMarqueeValue.trim()) {
            const newItems = [...marqueeItems]
            newItems[editingMarqueeIndex] = editingMarqueeValue.trim()
            setMarqueeItems(newItems)
        }
        setEditingMarqueeIndex(null)
        setEditingMarqueeValue('')
    }

    const cancelMarqueeEdit = () => {
        setEditingMarqueeIndex(null)
        setEditingMarqueeValue('')
    }

    const addSocialLink = () => {
        if (newSocialPlatform && newSocialUrl.trim()) {
            setSocialLinks([...socialLinks, { platform: newSocialPlatform, url: newSocialUrl.trim() }])
            setNewSocialPlatform('')
            setNewSocialUrl('')
        }
    }

    const removeSocialLink = (index: number) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index))
    }

    const onSubmit = (formData: SettingsFormData) => {
        updateMutation.mutate(formData)
    }

    if (isLoading) {
        return <PageSkeleton />
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-frank font-bold text-barby-gold">הגדרות האתר</h1>
                <p className="text-barby-cream/60">ניהול הגדרות כלליות של האתר</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Marquee Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>הודעות קרוסלה (לידיעתכם)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-barby-cream/60 text-sm">
                            הוסיפו הודעות שיוצגו בקרוסלה הרצה בעמוד הבית
                        </p>

                        {/* Current items */}
                        <div className="space-y-2">
                            {marqueeItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 bg-barby-darker/50 p-3 rounded-lg border border-barby-gold/20"
                                >
                                    <div className="flex flex-col gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveMarqueeItem(index, 'up')}
                                            disabled={index === 0 || editingMarqueeIndex !== null}
                                            className="text-barby-cream/40 hover:text-barby-gold disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <FiMove className="w-3 h-3 rotate-180" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveMarqueeItem(index, 'down')}
                                            disabled={index === marqueeItems.length - 1 || editingMarqueeIndex !== null}
                                            className="text-barby-cream/40 hover:text-barby-gold disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <FiMove className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {editingMarqueeIndex === index ? (
                                        <Input
                                            value={editingMarqueeValue}
                                            onChange={(e) => setEditingMarqueeValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    saveMarqueeEdit()
                                                } else if (e.key === 'Escape') {
                                                    cancelMarqueeEdit()
                                                }
                                            }}
                                            className="flex-1"
                                            autoFocus
                                        />
                                    ) : (
                                        <span
                                            className="flex-1 text-barby-cream cursor-pointer hover:text-barby-gold transition-colors"
                                            onDoubleClick={() => startEditingMarquee(index)}
                                        >
                                            {item}
                                        </span>
                                    )}

                                    {editingMarqueeIndex === index ? (
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={saveMarqueeEdit}
                                                className="text-green-500 hover:text-green-400 p-1"
                                                title="שמור"
                                            >
                                                <FiCheck className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelMarqueeEdit}
                                                className="text-barby-red/70 hover:text-barby-red p-1"
                                                title="בטל"
                                            >
                                                <FiX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => startEditingMarquee(index)}
                                                className="text-barby-cream/40 hover:text-barby-gold p-1"
                                                title="ערוך"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeMarqueeItem(index)}
                                                className="text-barby-red/70 hover:text-barby-red p-1"
                                                title="מחק"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {marqueeItems.length === 0 && (
                                <p className="text-barby-cream/40 text-center py-4">
                                    אין הודעות בקרוסלה
                                </p>
                            )}
                        </div>

                        {/* Add new item */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="הוסף הודעה חדשה..."
                                value={newMarqueeItem}
                                onChange={(e) => setNewMarqueeItem(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        addMarqueeItem()
                                    }
                                }}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={addMarqueeItem}
                                disabled={!newMarqueeItem.trim()}
                            >
                                <FiPlus className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>פרטי קשר (Footer)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="כתובת"
                            {...register('footer.address')}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="טלפון"
                                type="tel"
                                dir="ltr"
                                {...register('footer.phone')}
                            />
                            <Input
                                label="אימייל"
                                type="email"
                                dir="ltr"
                                {...register('footer.email')}
                            />
                        </div>
                        <Textarea
                            label="טקסט זכויות יוצרים"
                            rows={2}
                            {...register('footer.copyrightText')}
                        />

                        {/* Navigation URLs */}
                        <div className="pt-4 border-t border-barby-gold/20">
                            <h4 className="text-barby-gold text-sm font-medium mb-3">קישורי ניווט (לחיצה על הכתובת)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="קישור Google Maps"
                                    type="url"
                                    dir="ltr"
                                    placeholder="https://www.google.com/maps/place/..."
                                    {...register('footer.googleMapsUrl')}
                                />
                                <Input
                                    label="קישור Waze"
                                    type="url"
                                    dir="ltr"
                                    placeholder="https://waze.com/ul?ll=..."
                                    {...register('footer.wazeUrl')}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Social Links */}
                <Card>
                    <CardHeader>
                        <CardTitle>רשתות חברתיות</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-barby-cream/60 text-sm">
                            הוסיפו קישורים לרשתות החברתיות שיוצגו בפוטר
                        </p>

                        {/* Current social links */}
                        <div className="space-y-2">
                            {socialLinks.map((link, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 bg-barby-darker/50 p-3 rounded-lg border border-barby-gold/20"
                                >
                                    <span className="font-medium text-barby-gold min-w-[100px]">
                                        {SOCIAL_PLATFORMS.find(p => p.value === link.platform)?.label || link.platform}
                                    </span>
                                    <span className="flex-1 text-barby-cream/60 text-sm truncate" dir="ltr">
                                        {link.url}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeSocialLink(index)}
                                        className="text-barby-red/70 hover:text-barby-red p-1"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {socialLinks.length === 0 && (
                                <p className="text-barby-cream/40 text-center py-4">
                                    לא הוגדרו רשתות חברתיות
                                </p>
                            )}
                        </div>

                        {/* Add new social link */}
                        <div className="flex gap-2">
                            <Select
                                value={newSocialPlatform}
                                onChange={(e) => setNewSocialPlatform(e.target.value)}
                                className="w-40"
                                options={[
                                    { value: '', label: 'בחר רשת...' },
                                    ...SOCIAL_PLATFORMS,
                                ]}
                            />
                            <Input
                                placeholder="כתובת URL..."
                                value={newSocialUrl}
                                onChange={(e) => setNewSocialUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        addSocialLink()
                                    }
                                }}
                                className="flex-1"
                                dir="ltr"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={addSocialLink}
                                disabled={!newSocialPlatform || !newSocialUrl.trim()}
                            >
                                <FiPlus className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-3 pt-4">
                    <Button
                        type="submit"
                        isLoading={updateMutation.isPending}
                    >
                        שמור שינויים
                    </Button>
                </div>
            </form>
        </div>
    )
}
