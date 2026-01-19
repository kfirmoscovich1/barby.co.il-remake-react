import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatPrice, getImageUrl } from '@/utils'
import { Button, EmptyState, PageSkeleton, Input } from '@/components/common'
import { Chandelier } from '@/components/feature'
import { publicApi, orderApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { useAuth } from '@/context/AuthContext'
import { FiArrowRight, FiCreditCard, FiUser, FiCheck, FiLock } from 'react-icons/fi'
import {
    validateEmail,
    validatePhone,
    validateIdNumber,
    validateCardNumber,
    validateExpiry,
    validateCvv,
    handlePhoneInput,
    handleCardNumberInput,
    handleExpiryInput,
    handleCvvInput,
    handleIdNumberInput,
    ERROR_MESSAGES,
} from '@/utils/validation'

// Format date in Hebrew - full format
function formatShowDate(dateISO: string): { day: string; fullDate: string } {
    const dateObj = new Date(dateISO)
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    const day = days[dateObj.getDay()]
    const dayNum = dateObj.getDate().toString().padStart(2, '0')
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    const year = dateObj.getFullYear()
    return { day: `יום ${day}`, fullDate: `${dayNum}/${month}/${year}` }
}

export function ShowDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)

    // Fetch show from API
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.shows.detail(slug!),
        queryFn: () => publicApi.getShow(slug!),
        enabled: !!slug,
    })

    const show = data?.show

    // Track quantities for each ticket tier - must be before any conditional returns!
    const [quantities, setQuantities] = useState<number[]>([])
    const [showCheckoutForm, setShowCheckoutForm] = useState(false)
    const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'confirmation'>('details')
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        idNumber: '',
        email: '',
        phone: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cardHolder: '',
    })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [orderNumber, setOrderNumber] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const queryClient = useQueryClient()

    // Create order mutation
    const createOrderMutation = useMutation({
        mutationFn: orderApi.create,
        onSuccess: (order) => {
            setOrderNumber(order.orderNumber)
            queryClient.invalidateQueries({ queryKey: queryKeys.orders.my })
            setCheckoutStep('confirmation')
            setIsSubmitting(false)
        },
        onError: (error) => {
            console.error('Error creating order:', error)
            setFormErrors({ submit: 'אירעה שגיאה בשמירת ההזמנה. נסה שנית.' })
            setIsSubmitting(false)
        },
    })

    // Reset quantities when show changes
    const ticketTiersCount = show?.ticketTiers?.length ?? 0
    if (quantities.length !== ticketTiersCount && ticketTiersCount > 0) {
        setQuantities(show!.ticketTiers.map(() => 0))
    }

    if (isLoading) {
        return <PageSkeleton />
    }

    if (error || !show) {
        return (
            <div className="min-h-screen">
                <section className="relative py-6 md:py-10">
                    <div className="flex justify-center">
                        <Chandelier size="xl" />
                    </div>
                </section>
                <EmptyState
                    title="ההופעה לא נמצאה"
                    message="מצטערים, ההופעה שחיפשת לא קיימת או שהוסרה מהאתר"
                    icon="music"
                    showHomeButton={true}
                    showShowsButton={true}
                />
            </div>
        )
    }

    const isSoldOut = show.status === 'sold_out'
    const { day, fullDate } = formatShowDate(show.dateISO)
    const imageUrl = show.imageMediaId ? getImageUrl(show.imageMediaId) : null

    // Calculate total
    const total = show.ticketTiers.reduce((sum, tier, index) => sum + tier.price * (quantities[index] || 0), 0)
    const hasSelectedTickets = quantities.some(q => q > 0)

    // Get selected tickets summary
    const selectedTickets = show.ticketTiers
        .map((tier, index) => ({ ...tier, quantity: quantities[index] || 0 }))
        .filter(t => t.quantity > 0)

    const handleContinueToCheckout = () => {
        if (!hasSelectedTickets) return

        // Check if user is authenticated
        if (!isAuthenticated) {
            setShowLoginPrompt(true)
            return
        }

        // Pre-fill form with user data if available
        if (user) {
            const [firstName, ...lastNameParts] = (user.name || '').split(' ')
            setFormData(prev => ({
                ...prev,
                firstName: firstName || '',
                lastName: lastNameParts.join(' ') || '',
                email: user.email || '',
            }))
        }

        setShowCheckoutForm(true)
        setCheckoutStep('details')
    }

    const handleBackToTickets = () => {
        setShowCheckoutForm(false)
        setCheckoutStep('details')
    }

    const handleContinueToPayment = () => {
        const errors: Record<string, string> = {}

        if (!formData.firstName.trim()) errors.firstName = ERROR_MESSAGES.REQUIRED
        if (!formData.lastName.trim()) errors.lastName = ERROR_MESSAGES.REQUIRED
        if (!formData.idNumber.trim()) errors.idNumber = ERROR_MESSAGES.REQUIRED
        else if (!validateIdNumber(formData.idNumber)) errors.idNumber = ERROR_MESSAGES.ID_NUMBER_INVALID_LENGTH
        if (!formData.email.trim()) errors.email = ERROR_MESSAGES.REQUIRED
        else if (!validateEmail(formData.email)) errors.email = ERROR_MESSAGES.EMAIL_INVALID
        if (!formData.phone.trim()) errors.phone = ERROR_MESSAGES.REQUIRED
        else if (!validatePhone(formData.phone)) errors.phone = ERROR_MESSAGES.PHONE_INVALID_LENGTH

        setFormErrors(errors)
        if (Object.keys(errors).length > 0) return

        setCheckoutStep('payment')
    }

    const handleSubmitPayment = () => {
        const errors: Record<string, string> = {}

        if (!formData.cardNumber.trim()) errors.cardNumber = ERROR_MESSAGES.REQUIRED
        else if (!validateCardNumber(formData.cardNumber)) errors.cardNumber = ERROR_MESSAGES.CARD_NUMBER_INVALID_LUHN
        if (!formData.cardHolder.trim()) errors.cardHolder = ERROR_MESSAGES.REQUIRED
        if (!formData.cardExpiry.trim()) errors.cardExpiry = ERROR_MESSAGES.REQUIRED
        else if (!validateExpiry(formData.cardExpiry)) errors.cardExpiry = ERROR_MESSAGES.EXPIRY_INVALID_FORMAT
        if (!formData.cardCvv.trim()) errors.cardCvv = ERROR_MESSAGES.REQUIRED
        else if (!validateCvv(formData.cardCvv)) errors.cardCvv = ERROR_MESSAGES.CVV_INVALID_LENGTH

        setFormErrors(errors)
        if (Object.keys(errors).length > 0) return

        // Create the order
        setIsSubmitting(true)
        createOrderMutation.mutate({
            showId: show!.id,
            tickets: selectedTickets.map(t => ({
                tierLabel: t.label,
                tierPrice: t.price,
                quantity: t.quantity,
            })),
            userPhone: formData.phone.replace(/\D/g, ''),
            userIdNumber: formData.idNumber,
        })
    }

    // Login Prompt Component
    const renderLoginPrompt = () => (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-barby-darker border-2 border-barby-gold/50 rounded-lg p-6 max-w-md w-full">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-barby-gold/20 flex items-center justify-center">
                        <FiLock className="w-8 h-8 text-barby-gold" />
                    </div>
                    <h3 className="text-xl font-bold text-barby-gold mb-2">נדרשת התחברות</h3>
                    <p className="text-barby-cream/70 mb-6">
                        על מנת להשלים את הרכישה, יש להתחבר לחשבון או להירשם כמשתמש חדש.
                    </p>
                    <div className="space-y-3">
                        <Button
                            className="w-full"
                            onClick={() => navigate('/login', { state: { from: `/shows/${slug}` } })}
                        >
                            התחבר / הירשם
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setShowLoginPrompt(false)}
                        >
                            חזרה
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )

    // Checkout Form Component
    const renderCheckoutForm = () => (
        <div className="bg-barby-burgundy/40 border-2 border-barby-gold/50 rounded-lg p-6 lg:p-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
                <div className={`flex items-center gap-2 ${checkoutStep === 'details' ? 'text-barby-gold' : 'text-barby-cream/40'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${checkoutStep === 'details' ? 'border-barby-gold bg-barby-gold/20' : checkoutStep === 'payment' || checkoutStep === 'confirmation' ? 'border-green-500 bg-green-500/20' : 'border-barby-cream/40'}`}>
                        {checkoutStep === 'payment' || checkoutStep === 'confirmation' ? <FiCheck className="text-green-500" /> : '1'}
                    </div>
                    <span className="hidden sm:inline">פרטים אישיים</span>
                </div>
                <div className="w-8 h-0.5 bg-barby-gold/30" />
                <div className={`flex items-center gap-2 ${checkoutStep === 'payment' ? 'text-barby-gold' : 'text-barby-cream/40'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${checkoutStep === 'payment' ? 'border-barby-gold bg-barby-gold/20' : checkoutStep === 'confirmation' ? 'border-green-500 bg-green-500/20' : 'border-barby-cream/40'}`}>
                        {checkoutStep === 'confirmation' ? <FiCheck className="text-green-500" /> : '2'}
                    </div>
                    <span className="hidden sm:inline">תשלום</span>
                </div>
                <div className="w-8 h-0.5 bg-barby-gold/30" />
                <div className={`flex items-center gap-2 ${checkoutStep === 'confirmation' ? 'text-barby-gold' : 'text-barby-cream/40'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${checkoutStep === 'confirmation' ? 'border-green-500 bg-green-500/20' : 'border-barby-cream/40'}`}>
                        {checkoutStep === 'confirmation' ? <FiCheck className="text-green-500" /> : '3'}
                    </div>
                    <span className="hidden sm:inline">אישור</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Order Summary - Right Side */}
                <div className="lg:col-span-1 order-1 lg:order-2">
                    <div className="bg-barby-dark/50 rounded-lg p-4 border border-barby-gold/20 sticky top-4">
                        <h3 className="text-lg font-bold text-barby-gold mb-4">סיכום הזמנה</h3>
                        <div className="space-y-3 mb-4">
                            <div className="text-barby-cream font-medium">{show.title}</div>
                            <div className="text-barby-cream/60 text-sm">{fullDate} | {day}</div>
                            <div className="border-t border-barby-gold/10 pt-3">
                                {selectedTickets.map((ticket, index) => (
                                    <div key={index} className="flex justify-between text-sm mb-2">
                                        <span className="text-barby-cream">{ticket.label} x{ticket.quantity}</span>
                                        <span className="text-barby-gold">{formatPrice(ticket.price * ticket.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="border-t border-barby-gold/20 pt-3 flex justify-between">
                            <span className="text-barby-cream font-medium">סה"כ:</span>
                            <span className="text-xl font-bold text-barby-gold">{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Form - Left Side */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                    {checkoutStep === 'details' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-barby-gold flex items-center gap-2">
                                <FiUser /> פרטים אישיים
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                    label="שם פרטי"
                                    placeholder="הזן שם פרטי"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    error={formErrors.firstName}
                                />
                                <Input
                                    label="שם משפחה"
                                    placeholder="הזן שם משפחה"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    error={formErrors.lastName}
                                />
                            </div>
                            <Input
                                label="תעודת זהות"
                                placeholder="123456789"
                                value={formData.idNumber}
                                onChange={(e) => setFormData({ ...formData, idNumber: handleIdNumberInput(e.target.value) })}
                                error={formErrors.idNumber}
                                inputMode="numeric"
                                maxLength={9}
                            />
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                    label="אימייל"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    error={formErrors.email}
                                />
                                <Input
                                    label="טלפון"
                                    type="tel"
                                    placeholder="0501234567"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: handlePhoneInput(e.target.value) })}
                                    error={formErrors.phone}
                                    inputMode="numeric"
                                    maxLength={10}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" onClick={handleBackToTickets}>
                                    <FiArrowRight className="ml-2" /> חזרה
                                </Button>
                                <Button onClick={handleContinueToPayment} className="flex-1">
                                    המשך לתשלום
                                </Button>
                            </div>
                        </div>
                    )}

                    {checkoutStep === 'payment' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-barby-gold flex items-center gap-2">
                                <FiCreditCard /> פרטי תשלום
                            </h2>
                            <Input
                                label="מספר כרטיס"
                                placeholder="1234 5678 9012 3456"
                                value={formData.cardNumber}
                                onChange={(e) => setFormData({ ...formData, cardNumber: handleCardNumberInput(e.target.value) })}
                                error={formErrors.cardNumber}
                                inputMode="numeric"
                                maxLength={23}
                            />
                            <Input
                                label="שם בעל הכרטיס"
                                placeholder="שם כפי שמופיע על הכרטיס"
                                value={formData.cardHolder}
                                onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })}
                                error={formErrors.cardHolder}
                            />
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                    label="תוקף"
                                    placeholder="MM/YY"
                                    value={formData.cardExpiry}
                                    onChange={(e) => setFormData({ ...formData, cardExpiry: handleExpiryInput(e.target.value) })}
                                    error={formErrors.cardExpiry}
                                    inputMode="numeric"
                                    maxLength={5}
                                />
                                <Input
                                    label="CVV"
                                    placeholder="123"
                                    maxLength={4}
                                    value={formData.cardCvv}
                                    onChange={(e) => setFormData({ ...formData, cardCvv: handleCvvInput(e.target.value, formData.cardNumber) })}
                                    error={formErrors.cardCvv}
                                    inputMode="numeric"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setCheckoutStep('details')} disabled={isSubmitting}>
                                    <FiArrowRight className="ml-2" /> חזרה
                                </Button>
                                <Button onClick={handleSubmitPayment} className="flex-1" disabled={isSubmitting}>
                                    {isSubmitting ? 'מעבד תשלום...' : `שלם ${formatPrice(total)}`}
                                </Button>
                            </div>
                            {formErrors.submit && (
                                <p className="text-red-400 text-sm text-center mt-2">{formErrors.submit}</p>
                            )}
                        </div>
                    )}

                    {checkoutStep === 'confirmation' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                <FiCheck className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-barby-gold mb-4">ההזמנה בוצעה בהצלחה!</h2>
                            <p className="text-barby-cream/80 mb-2">תודה על הרכישה, {formData.firstName}!</p>
                            {orderNumber && (
                                <p className="text-barby-cream/80 mb-2">מספר הזמנה: <span className="font-bold text-barby-gold">{orderNumber}</span></p>
                            )}
                            <p className="text-barby-cream/60 mb-6">אישור הזמנה נשלח לכתובת {formData.email}</p>
                            <div className="bg-barby-dark/50 rounded-lg p-4 border border-barby-gold/20 max-w-md mx-auto">
                                <div className="text-barby-cream font-medium mb-2">{show.title}</div>
                                <div className="text-barby-cream/60 text-sm">{fullDate} | {day}</div>
                                <div className="text-barby-cream/60 text-sm">{show.venueName}</div>
                                <div className="mt-3 pt-3 border-t border-barby-gold/20">
                                    {selectedTickets.map((ticket, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-barby-cream">{ticket.label} x{ticket.quantity}</span>
                                            <span className="text-barby-gold">{formatPrice(ticket.price * ticket.quantity)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between font-bold mt-2 pt-2 border-t border-barby-gold/10">
                                        <span className="text-barby-cream">סה"כ:</span>
                                        <span className="text-barby-gold">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-center mt-6">
                                <Button variant="ghost" onClick={() => navigate('/profile')}>
                                    לאזור האישי
                                </Button>
                                <Button onClick={() => navigate('/')}>
                                    חזרה לעמוד הבית
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            {/* Login Prompt Modal */}
            {showLoginPrompt && renderLoginPrompt()}

            {/* Chandelier Header */}
            <section className="relative py-6 md:py-10">
                <div className="flex justify-center">
                    <Chandelier size="xl" />
                </div>
            </section>

            {/* Back Link */}
            <div className="container mx-auto px-4 mb-4">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-barby-cream/60 hover:text-barby-gold transition-colors text-sm"
                >
                    → לעמוד הבית
                </Link>
            </div>

            {/* Main Show Card or Checkout Form */}
            {showCheckoutForm ? (
                <section className="container mx-auto px-4 pb-8">
                    {renderCheckoutForm()}
                </section>
            ) : (
                <section className="container mx-auto px-4 pb-8">
                    <div className="bg-barby-burgundy/40 border-2 border-barby-gold/50 rounded-lg overflow-hidden">
                        <div className="flex flex-col lg:flex-row">
                            {/* Show Image */}
                            <div className="lg:w-2/5 aspect-[4/3] lg:aspect-square overflow-hidden">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={show.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-barby-darker/50 flex items-center justify-center">
                                        <Chandelier size="lg" />
                                    </div>
                                )}
                            </div>

                            {/* Show Info */}
                            <div className="lg:w-3/5 p-6 lg:p-8 flex flex-col lg:max-h-[750px]">
                                {/* Scrollable Info Content */}
                                <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                    {/* Title */}
                                    <h1 className="text-2xl md:text-4xl font-bold text-barby-gold mb-2">
                                        {show.title}
                                    </h1>

                                    {/* Date & Time */}
                                    <p className="text-barby-cream/80 text-sm md:text-lg mb-4 whitespace-nowrap">
                                        {fullDate} | {day} | דלתות: {show.doorsTime || '20:30'}
                                    </p>

                                    {/* Show Type Text */}
                                    <p className="text-barby-cream/60 text-xs md:text-sm mb-6 whitespace-nowrap">
                                        {show.isStanding === false ? 'מופע ישיבה' : show.is360 ? 'מופע עמידה 360' : 'מופע עמידה'}
                                        <span className="mx-1 md:mx-2">|</span>
                                        (הופעה מתחילה שעה עד שעה וחצי מפתיחת דלתות)
                                    </p>

                                    {/* Description */}
                                    {show.description && (
                                        <div
                                            className="text-barby-cream/90 leading-relaxed mb-6 whitespace-pre-line"
                                            dangerouslySetInnerHTML={{ __html: show.description }}
                                        />
                                    )}
                                </div>

                                {/* Price & Tickets - Fixed at bottom */}
                                <div className="mt-4 flex-shrink-0">
                                    <div className="bg-barby-dark/50 rounded-lg border border-barby-gold/20 p-3 md:p-4">
                                        {/* Header Row */}
                                        <div className="flex items-center justify-between gap-4 pb-3 mb-3 border-b border-barby-gold/10">
                                            <span className="text-barby-cream/60 text-sm">מחיר</span>
                                            <span className="text-barby-cream/60 text-sm">סוג כרטיס</span>
                                            <span className="text-barby-cream/60 text-sm">כמות</span>
                                        </div>

                                        {/* Ticket Tiers */}
                                        <div className="space-y-3 mb-3">
                                            {show.ticketTiers.map((tier, index) => (
                                                <div key={index} className="flex items-center justify-between gap-2 md:gap-4">
                                                    <span className="text-sm md:text-lg font-bold text-barby-gold whitespace-nowrap">{formatPrice(tier.price)}</span>
                                                    <span className="text-barby-cream flex-1 text-center text-sm md:text-base whitespace-nowrap">{tier.label}</span>
                                                    <select
                                                        className="bg-barby-darker border border-barby-gold/30 text-barby-cream px-2 md:px-3 py-1.5 md:py-2 rounded min-w-[60px] md:min-w-[70px] text-sm md:text-base"
                                                        value={quantities[index]}
                                                        onChange={(e) => {
                                                            const newQuantities = [...quantities]
                                                            newQuantities[index] = Number(e.target.value)
                                                            setQuantities(newQuantities)
                                                        }}
                                                        disabled={isSoldOut}
                                                    >
                                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                            <option key={num} value={num}>{num}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Total */}
                                        <div className="flex items-center justify-between py-3 mb-4 border-t border-barby-gold/20">
                                            <span className="text-barby-cream font-medium">סה"כ לתשלום:</span>
                                            <span className="text-xl font-bold text-barby-gold">{formatPrice(total)}</span>
                                        </div>

                                        {/* Buy Button */}
                                        {!isSoldOut ? (
                                            <Button
                                                size="lg"
                                                className={`w-full text-lg py-4 ${!hasSelectedTickets ? 'cursor-default opacity-50' : ''}`}
                                                onClick={handleContinueToCheckout}
                                                disabled={!hasSelectedTickets}
                                            >
                                                המשך לרכישה
                                            </Button>
                                        ) : (
                                            <div className="text-center py-4 bg-barby-red/20 rounded-lg text-red-400 font-medium">
                                                אזלו הכרטיסים להופעה זו
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Registration Note */}
            <section className="container mx-auto px-4 pb-12">
                <p className="text-center text-barby-cream/50 text-sm lg:whitespace-nowrap">
                    יש צורך בהרשמה בכדי להפוך למשתמש רשום וזאת בכדי להגן על פרטי הלקוח ואמצעי התשלום שברשותו, אם אינך משתמש רשום תהליך ההרשמה יערך בעת הרכישה
                </p>
            </section>
        </div>
    )
}
