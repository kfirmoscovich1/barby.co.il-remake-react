import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { Button, Input } from '@/components/common'
import { Chandelier } from '@/components/feature'
import { giftCardApi, orderApi, authApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { formatPrice } from '@/utils'
import { validatePassword, ERROR_MESSAGES } from '@/lib/validation'
import { FiEye, FiEyeOff, FiGift, FiCopy, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import toast from 'react-hot-toast'
import type { GiftCard, OrderStatus } from '@/types'

type TabType = 'info' | 'orders' | 'giftcards'

// Format date helper
function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

// Get status display text and color
function getGiftCardStatusDisplay(giftCard: GiftCard): { text: string; color: string; bgColor: string } {
    const now = new Date()
    const expiresAt = new Date(giftCard.expiresAt)

    if (giftCard.status === 'redeemed' || giftCard.balance === 0) {
        return { text: 'מומש', color: 'text-gray-400', bgColor: 'bg-gray-500/20' }
    }
    if (giftCard.status === 'expired' || expiresAt < now) {
        return { text: 'פג תוקף', color: 'text-red-400', bgColor: 'bg-red-500/20' }
    }
    if (giftCard.status === 'partially_used') {
        return { text: 'מומש חלקית', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
    }
    return { text: 'פעיל', color: 'text-green-400', bgColor: 'bg-green-500/20' }
}

// Get order status display
function getOrderStatusDisplay(status: OrderStatus): { text: string; color: string; bgColor: string } {
    switch (status) {
        case 'confirmed':
            return { text: 'מאושר', color: 'text-green-400', bgColor: 'bg-green-500/20' }
        case 'pending':
            return { text: 'ממתין', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
        case 'cancelled':
            return { text: 'בוטל', color: 'text-red-400', bgColor: 'bg-red-500/20' }
        case 'refunded':
            return { text: 'הוחזר', color: 'text-gray-400', bgColor: 'bg-gray-500/20' }
        default:
            return { text: status, color: 'text-barby-cream', bgColor: 'bg-barby-dark/50' }
    }
}

export function UserProfilePage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<TabType>('info')
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [copiedCode, setCopiedCode] = useState<string | null>(null)
    const [expandedGiftCard, setExpandedGiftCard] = useState<string | null>(null)
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

    // Fetch user's orders
    const { data: myOrders = [], isLoading: isLoadingOrders } = useQuery({
        queryKey: queryKeys.orders.my,
        queryFn: orderApi.getMyOrders,
        enabled: activeTab === 'orders',
    })

    // Fetch user's gift cards (received)
    const { data: myGiftCards = [], isLoading: isLoadingMyGiftCards } = useQuery({
        queryKey: ['giftcards', 'my'],
        queryFn: giftCardApi.getMyGiftCards,
        enabled: activeTab === 'giftcards',
    })

    // Fetch gift cards purchased by user
    const { data: purchasedGiftCards = [], isLoading: isLoadingPurchasedGiftCards } = useQuery({
        queryKey: ['giftcards', 'purchased'],
        queryFn: giftCardApi.getPurchasedGiftCards,
        enabled: activeTab === 'giftcards',
    })

    // Password change form
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error(ERROR_MESSAGES.PASSWORDS_DONT_MATCH)
            return
        }
        if (!validatePassword(passwordData.newPassword)) {
            toast.error(ERROR_MESSAGES.PASSWORD_MIN_LENGTH)
            return
        }
        setIsLoading(true)
        try {
            await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword)
            toast.success('הסיסמה שונתה בהצלחה')
            setShowPasswordForm(false)
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message || 'שגיאה בשינוי הסיסמה')
            } else {
                toast.error('שגיאה בשינוי הסיסמה')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code)
            setCopiedCode(code)
            toast.success('הקוד הועתק!')
            setTimeout(() => setCopiedCode(null), 2000)
        } catch (error) {
            toast.error('שגיאה בהעתקת הקוד')
        }
    }

    // Get real user data from auth context
    const nameParts = user?.name?.split(' ') || []
    const userData = {
        firstName: nameParts[0] || 'משתמש',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user?.email || '',
        phone: '', // TODO: Add phone to user model
        ordersCount: myOrders.length,
    }

    // Combine and deduplicate gift cards (user might have both purchased for self and received)
    const allGiftCards = [...myGiftCards]
    purchasedGiftCards.forEach(gc => {
        if (!allGiftCards.some(existing => existing.id === gc.id)) {
            allGiftCards.push(gc)
        }
    })

    return (
        <div className="min-h-screen">
            {/* Chandelier Header */}
            <section className="relative py-6 md:py-10">
                <div className="flex justify-center">
                    <Chandelier size="xl" />
                </div>
            </section>

            {/* Title Banner */}
            <section className="bg-barby-gold py-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-barby-dark text-center">
                    החשבון של {userData.firstName}
                </h1>
            </section>

            {/* Profile Content */}
            <section className="container mx-auto px-4 pb-16">
                <div className="max-w-4xl mx-auto">
                    {/* User Info Card */}
                    <div className="bg-barby-darker/40 border border-barby-gold/20 rounded-lg p-6 mb-6">
                        <div className="text-right space-y-2">
                            <p className="text-barby-cream">
                                <span className="text-barby-gold font-bold">שם מלא:</span>{' '}
                                {userData.firstName} {userData.lastName}
                            </p>
                            <p className="text-barby-cream">
                                <span className="text-barby-gold font-bold">אימייל:</span>{' '}
                                <span dir="ltr">{userData.email}</span>
                            </p>
                            <p className="text-barby-cream">
                                <span className="text-barby-gold font-bold">נייד:</span>{' '}
                                <span dir="ltr" className="underline">{userData.phone}</span>
                            </p>
                            <p className="text-barby-cream">
                                <span className="text-barby-gold font-bold">מספר הזמנות:</span>{' '}
                                {userData.ordersCount}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
                        <button
                            onClick={() => { setActiveTab('info'); setShowPasswordForm(true); }}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${activeTab === 'info' && showPasswordForm
                                ? 'bg-barby-gold/20 border-barby-gold text-barby-gold'
                                : 'bg-barby-darker/40 border-barby-gold/30 text-barby-cream hover:border-barby-gold/50'
                                }`}
                        >
                            שינוי סיסמה
                        </button>
                        <button
                            onClick={() => { setActiveTab('orders'); setShowPasswordForm(false); }}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${activeTab === 'orders'
                                ? 'bg-barby-gold/20 border-barby-gold text-barby-gold'
                                : 'bg-barby-darker/40 border-barby-gold/30 text-barby-cream hover:border-barby-gold/50'
                                }`}
                        >
                            היסטוריית הזמנות
                        </button>
                        <button
                            onClick={() => { setActiveTab('giftcards'); setShowPasswordForm(false); }}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${activeTab === 'giftcards'
                                ? 'bg-barby-gold/20 border-barby-gold text-barby-gold'
                                : 'bg-barby-darker/40 border-barby-gold/30 text-barby-cream hover:border-barby-gold/50'
                                }`}
                        >
                            גיפטקארד - GIFTCARD
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-barby-darker/40 border border-barby-gold/20 rounded-lg p-6">
                        {/* Password Change Form */}
                        {activeTab === 'info' && showPasswordForm && (
                            <form onSubmit={handlePasswordChange} className="max-w-md mx-auto space-y-4">
                                <h3 className="text-xl font-bold text-barby-gold text-center mb-4">
                                    שינוי סיסמה
                                </h3>
                                <div className="relative">
                                    <Input
                                        label="סיסמה נוכחית"
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="pl-10"
                                        dir="ltr"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-[42px] text-barby-cream/60 hover:text-barby-gold transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Input
                                        label="סיסמה חדשה"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="pl-10"
                                        dir="ltr"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute left-3 top-[42px] text-barby-cream/60 hover:text-barby-gold transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <Input
                                    label="אימות סיסמה חדשה"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    dir="ltr"
                                />
                                <Button type="submit" className="w-full" isLoading={isLoading}>
                                    שמור סיסמה חדשה
                                </Button>
                            </form>
                        )}

                        {/* Orders History */}
                        {activeTab === 'orders' && (
                            <div>
                                <h3 className="text-xl font-bold text-barby-gold text-center mb-4">
                                    היסטוריית הזמנות
                                </h3>

                                {isLoadingOrders ? (
                                    <div className="text-center py-8">
                                        <div className="text-barby-gold animate-pulse">טוען...</div>
                                    </div>
                                ) : myOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {myOrders.map((order) => {
                                            const status = getOrderStatusDisplay(order.status)
                                            const isExpanded = expandedOrder === order.id
                                            const orderDate = new Date(order.createdAt)
                                            const showDate = new Date(order.showDate)
                                            const totalTickets = order.tickets.reduce((sum, t) => sum + t.quantity, 0)

                                            return (
                                                <div
                                                    key={order.id}
                                                    className="bg-barby-dark/50 border border-barby-gold/20 rounded-lg overflow-hidden"
                                                >
                                                    {/* Main Row */}
                                                    <div
                                                        className="p-4 cursor-pointer hover:bg-barby-dark/70 transition-colors"
                                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                    >
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-3 mb-1">
                                                                    <span className="text-barby-cream font-medium truncate">
                                                                        {order.showTitle}
                                                                    </span>
                                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.bgColor} ${status.color}`}>
                                                                        {status.text}
                                                                    </span>
                                                                </div>
                                                                <div className="text-barby-cream/60 text-sm">
                                                                    {formatDate(showDate)} | {totalTickets} כרטיסים
                                                                </div>
                                                            </div>
                                                            <div className="text-left flex-shrink-0">
                                                                <div className="text-barby-gold font-bold">
                                                                    {formatPrice(order.totalAmount)}
                                                                </div>
                                                                <div className="text-barby-cream/50 text-xs">
                                                                    הזמנה #{order.orderNumber}
                                                                </div>
                                                            </div>
                                                            <div className="text-barby-gold">
                                                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details */}
                                                    {isExpanded && (
                                                        <div className="border-t border-barby-gold/20 p-4 bg-barby-darker/30">
                                                            <div className="grid gap-3 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-barby-cream/60">תאריך הזמנה:</span>
                                                                    <span className="text-barby-cream">{formatDate(orderDate)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-barby-cream/60">מיקום:</span>
                                                                    <span className="text-barby-cream">{order.showVenue}</span>
                                                                </div>
                                                                <div className="border-t border-barby-gold/10 pt-3 mt-2">
                                                                    <span className="text-barby-gold font-medium">פירוט כרטיסים:</span>
                                                                    <div className="mt-2 space-y-1">
                                                                        {order.tickets.map((ticket, idx) => (
                                                                            <div key={idx} className="flex justify-between">
                                                                                <span className="text-barby-cream">
                                                                                    {ticket.tierLabel} x{ticket.quantity}
                                                                                </span>
                                                                                <span className="text-barby-gold">
                                                                                    {formatPrice(ticket.subtotal)}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {order.giftCardAmountUsed && order.giftCardAmountUsed > 0 && (
                                                                    <div className="flex justify-between text-green-400">
                                                                        <span>שימוש בגיפט קארד:</span>
                                                                        <span>-{formatPrice(order.giftCardAmountUsed)}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between font-bold pt-2 border-t border-barby-gold/10">
                                                                    <span className="text-barby-cream">סה"כ:</span>
                                                                    <span className="text-barby-gold">{formatPrice(order.totalAmount)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-barby-gold/10 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-barby-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                            </svg>
                                        </div>
                                        <p className="text-barby-cream/70 mb-2">אין הזמנות עדיין</p>
                                        <p className="text-barby-cream/50 text-sm mb-4">
                                            לאחר רכישת כרטיסים, ההזמנות שלך יופיעו כאן
                                        </p>
                                        <Link to="/">
                                            <Button variant="outline">
                                                לצפייה בהופעות
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Gift Cards */}
                        {activeTab === 'giftcards' && (
                            <div>
                                <h3 className="text-xl font-bold text-barby-gold text-center mb-4 flex items-center justify-center gap-2">
                                    <FiGift /> הגיפטקארדים שלי
                                </h3>

                                {(isLoadingMyGiftCards || isLoadingPurchasedGiftCards) ? (
                                    <div className="text-center py-8">
                                        <div className="text-barby-gold animate-pulse">טוען...</div>
                                    </div>
                                ) : allGiftCards.length > 0 ? (
                                    <div className="space-y-4 mb-6">
                                        {allGiftCards.map((gc) => {
                                            const status = getGiftCardStatusDisplay(gc)
                                            const isExpanded = expandedGiftCard === gc.id
                                            const isPurchaser = gc.purchaserEmail === user?.email

                                            return (
                                                <div
                                                    key={gc.id}
                                                    className="bg-barby-dark/50 border border-barby-gold/20 rounded-lg overflow-hidden"
                                                >
                                                    {/* Main Row */}
                                                    <div
                                                        className="p-4 cursor-pointer hover:bg-barby-dark/70 transition-colors"
                                                        onClick={() => setExpandedGiftCard(isExpanded ? null : gc.id)}
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-full ${status.bgColor} flex items-center justify-center`}>
                                                                    <FiGift className={status.color} />
                                                                </div>
                                                                <div>
                                                                    <div className="text-barby-cream font-medium">
                                                                        גיפטקארד בשווי ₪{gc.amount.toLocaleString()}
                                                                    </div>
                                                                    <div className="text-barby-cream/60 text-sm">
                                                                        {gc.isForSelf ? 'לשימוש עצמי' : isPurchaser ? `נשלח ל: ${gc.recipientName}` : `מאת: ${gc.purchaserName}`}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-left">
                                                                    <div className={`text-sm font-medium ${status.color}`}>
                                                                        {status.text}
                                                                    </div>
                                                                    <div className="text-barby-cream/60 text-xs">
                                                                        יתרה: ₪{gc.balance.toLocaleString()}
                                                                    </div>
                                                                </div>
                                                                <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                                    <svg className="w-5 h-5 text-barby-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details */}
                                                    {isExpanded && (
                                                        <div className="border-t border-barby-gold/10 p-4 bg-barby-darker/30">
                                                            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                                                <div>
                                                                    <div className="text-barby-cream/60 text-xs mb-1">קוד הגיפטקארד:</div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-mono text-barby-gold text-lg tracking-wider" dir="ltr">
                                                                            {gc.code}
                                                                        </span>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                copyToClipboard(gc.code)
                                                                            }}
                                                                            className="p-1 hover:bg-barby-gold/20 rounded transition-colors"
                                                                            title="העתק קוד"
                                                                        >
                                                                            {copiedCode === gc.code ? (
                                                                                <FiCheck className="w-4 h-4 text-green-400" />
                                                                            ) : (
                                                                                <FiCopy className="w-4 h-4 text-barby-cream/60" />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-barby-cream/60 text-xs mb-1">סכום מקורי:</div>
                                                                    <div className="text-barby-cream">₪{gc.amount.toLocaleString()}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-barby-cream/60 text-xs mb-1">יתרה נוכחית:</div>
                                                                    <div className="text-barby-gold font-bold">₪{gc.balance.toLocaleString()}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-barby-cream/60 text-xs mb-1">תאריך רכישה:</div>
                                                                    <div className="text-barby-cream" dir="ltr">{formatDate(gc.purchasedAt)}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-barby-cream/60 text-xs mb-1">תוקף עד:</div>
                                                                    <div className="text-barby-cream" dir="ltr">{formatDate(gc.expiresAt)}</div>
                                                                </div>
                                                                {gc.message && (
                                                                    <div className="sm:col-span-2">
                                                                        <div className="text-barby-cream/60 text-xs mb-1">הודעה:</div>
                                                                        <div className="text-barby-cream bg-barby-dark/50 p-3 rounded border border-barby-gold/10">
                                                                            {gc.message}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Usage History */}
                                                            {gc.usageHistory && gc.usageHistory.length > 0 && (
                                                                <div className="mt-4">
                                                                    <div className="text-barby-cream/60 text-xs mb-2">היסטוריית שימוש:</div>
                                                                    <div className="bg-barby-dark/50 rounded border border-barby-gold/10 overflow-hidden">
                                                                        <table className="w-full text-sm">
                                                                            <thead>
                                                                                <tr className="bg-barby-gold/10">
                                                                                    <th className="py-2 px-3 text-right text-barby-gold text-xs">תאריך</th>
                                                                                    <th className="py-2 px-3 text-right text-barby-gold text-xs">סכום</th>
                                                                                    <th className="py-2 px-3 text-right text-barby-gold text-xs">תיאור</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {gc.usageHistory.map((usage, index) => (
                                                                                    <tr key={index} className="border-t border-barby-gold/10">
                                                                                        <td className="py-2 px-3 text-barby-cream text-xs" dir="ltr">
                                                                                            {formatDate(usage.date)}
                                                                                        </td>
                                                                                        <td className="py-2 px-3 text-red-400 text-xs">
                                                                                            -₪{usage.amount.toLocaleString()}
                                                                                        </td>
                                                                                        <td className="py-2 px-3 text-barby-cream/70 text-xs">
                                                                                            {usage.description}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-barby-gold/10 flex items-center justify-center">
                                            <FiGift className="w-8 h-8 text-barby-gold/50" />
                                        </div>
                                        <p className="text-barby-cream/70 mb-2">אין לך גיפטקארדים עדיין</p>
                                        <p className="text-barby-cream/50 text-sm">
                                            רכוש גיפטקארד לעצמך או קבל אחד מחבר
                                        </p>
                                    </div>
                                )}

                                <div className="text-center">
                                    <Link to="/giftcard">
                                        <Button variant="outline">
                                            <FiGift className="ml-2" />
                                            רכישת גיפטקארד חדש
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Back link */}
                    <div className="text-center mt-6">
                        <Link
                            to="/"
                            className="text-barby-cream/70 hover:text-barby-gold text-sm transition-colors inline-flex items-center gap-2"
                        >
                            <span>→</span>
                            <span>חזרה לעמוד הבית</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
