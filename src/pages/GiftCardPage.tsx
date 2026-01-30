import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Textarea } from '@/components/common'
import { Chandelier } from '@/components/feature'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { giftCardApi } from '@/services/api'
import { FiArrowRight, FiCreditCard, FiUser, FiCheck, FiLock, FiGift } from 'react-icons/fi'
import {
    validateEmail,
    validateCardNumber,
    validateExpiry,
    validateCvv,
    handlePhoneInput,
    handleCardNumberInput,
    handleExpiryInput,
    handleCvvInput,
    ERROR_MESSAGES,
} from '@/utils/validation'

// Gift card amount options
const GIFT_CARD_AMOUNTS = [100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000]

const formatPrice = (price: number) => `₪${price.toLocaleString()}`

export function GiftCardPage() {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [checkoutStep, setCheckoutStep] = useState<'select' | 'details' | 'payment' | 'confirmation'>('select')
    const [selectedAmount, setSelectedAmount] = useState<number>(0)
    const [customAmount, setCustomAmount] = useState<string>('')
    const [isForSelf, setIsForSelf] = useState(false)
    const [createdGiftCard, setCreatedGiftCard] = useState<{ code: string; amount: number } | null>(null)

    // Form data for checkout
    const [formData, setFormData] = useState({
        recipientFirstName: '',
        recipientLastName: '',
        recipientEmail: '',
        recipientPhone: '',
        message: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cardHolder: '',
    })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const actualAmount = selectedAmount || parseInt(customAmount) || 0
    const isValidAmount = actualAmount >= 100 && actualAmount <= 5000

    const handleContinueToDetails = () => {
        if (!isValidAmount) {
            toast.error('יש לבחור סכום בין 100₪ ל-5000₪')
            return
        }

        // Check if user is authenticated
        if (!isAuthenticated) {
            setShowLoginPrompt(true)
            return
        }

        // Pre-fill form with user data if for self
        if (user && isForSelf) {
            const [firstName, ...lastNameParts] = (user.name || '').split(' ')
            setFormData(prev => ({
                ...prev,
                recipientFirstName: firstName || '',
                recipientLastName: lastNameParts.join(' ') || '',
                recipientEmail: user.email || '',
            }))
        }

        setCheckoutStep('details')
    }

    const handleBackToSelect = () => {
        setCheckoutStep('select')
    }

    const handleContinueToPayment = () => {
        const errors: Record<string, string> = {}

        if (!formData.recipientFirstName.trim()) errors.recipientFirstName = ERROR_MESSAGES.REQUIRED
        if (!formData.recipientLastName.trim()) errors.recipientLastName = ERROR_MESSAGES.REQUIRED
        if (!formData.recipientEmail.trim()) errors.recipientEmail = ERROR_MESSAGES.REQUIRED
        else if (!validateEmail(formData.recipientEmail)) errors.recipientEmail = ERROR_MESSAGES.EMAIL_INVALID

        setFormErrors(errors)
        if (Object.keys(errors).length > 0) return

        setCheckoutStep('payment')
    }

    const handleSubmitPayment = async () => {
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

        setIsLoading(true)
        try {
            // Create gift card via API
            const giftCard = await giftCardApi.create({
                amount: actualAmount,
                recipientEmail: formData.recipientEmail,
                recipientName: `${formData.recipientFirstName} ${formData.recipientLastName}`,
                recipientPhone: formData.recipientPhone.replace(/\D/g, '') || undefined,
                isForSelf,
                message: formData.message || undefined,
            })

            setCreatedGiftCard({ code: giftCard.code, amount: giftCard.amount })
            setCheckoutStep('confirmation')
            toast.success('הגיפטקארד נוצר בהצלחה!')
        } catch (error) {
            console.error('Error creating gift card:', error)
            toast.error('שגיאה ביצירת הגיפטקארד')
        } finally {
            setIsLoading(false)
        }
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
                        על מנת לרכוש גיפטקארד, יש להתחבר לחשבון או להירשם כמשתמש חדש.
                    </p>
                    <div className="space-y-3">
                        <Button
                            className="w-full"
                            onClick={() => navigate('/login', { state: { from: '/giftcard' } })}
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

    // Amount Selection Component
    const renderAmountSelection = () => (
        <div className="bg-barby-darker/40 border border-barby-gold/20 rounded-lg overflow-hidden hover:border-barby-gold/50 transition-all">
            <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-barby-gold mb-6 text-center flex items-center justify-center gap-2">
                    <FiGift /> בחירת סכום הגיפטקארד
                </h2>

                {/* Amount Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                    {GIFT_CARD_AMOUNTS.map((amount) => (
                        <button
                            key={amount}
                            onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                            className={`py-3 px-4 rounded-lg border-2 transition-all font-medium ${selectedAmount === amount
                                ? 'bg-barby-gold/20 border-barby-gold text-barby-gold'
                                : 'bg-barby-darker/40 border-barby-gold/30 text-barby-cream hover:border-barby-gold/50'
                                }`}
                        >
                            {formatPrice(amount)}
                        </button>
                    ))}
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                    <label className="block text-barby-cream text-sm mb-2">או הזן סכום אחר (100₪ - 5000₪):</label>
                    <Input
                        type="number"
                        placeholder="הזן סכום"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(0); }}
                        min={100}
                        max={5000}
                        dir="ltr"
                    />
                </div>

                {/* For Self Toggle */}
                <div className="mb-6 p-4 bg-barby-dark/30 rounded-lg border border-barby-gold/10">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isForSelf}
                            onChange={(e) => setIsForSelf(e.target.checked)}
                            className="w-5 h-5 rounded border-barby-gold/30 text-barby-gold focus:ring-barby-gold"
                        />
                        <span className="text-barby-cream">הגיפטקארד מיועד לעצמי</span>
                    </label>
                    <p className="text-barby-cream/60 text-sm mt-2 mr-8">
                        {isForSelf
                            ? 'הגיפטקארד יופיע בחשבון שלך מיד לאחר הרכישה'
                            : 'הגיפטקארד יישלח לנמען באימייל'}
                    </p>
                </div>

                {/* Selected Amount Summary */}
                {isValidAmount && (
                    <div className="bg-barby-dark/50 rounded-lg p-4 border border-barby-gold/20 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-barby-cream">סכום הגיפטקארד:</span>
                            <span className="text-2xl font-bold text-barby-gold">{formatPrice(actualAmount)}</span>
                        </div>
                        <p className="text-barby-cream/60 text-sm mt-2">תקף ל-5 שנים מתאריך הרכישה</p>
                    </div>
                )}

                {/* Continue Button */}
                <Button
                    size="lg"
                    className={`w-full text-lg py-4 ${!isValidAmount ? 'cursor-default opacity-50' : ''}`}
                    onClick={handleContinueToDetails}
                    disabled={!isValidAmount}
                >
                    המשך לפרטי הנמען
                </Button>
            </div>
        </div>
    )

    // Checkout Form Component
    const renderCheckoutForm = () => (
        <div className="bg-barby-burgundy/40 border-2 border-barby-gold/50 rounded-lg p-6 lg:p-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
                <div className={`flex items-center gap-2 ${checkoutStep === 'details' ? 'text-barby-gold' : 'text-barby-cream/40'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${checkoutStep === 'details' ? 'border-barby-gold bg-barby-gold/20' :
                        checkoutStep === 'payment' || checkoutStep === 'confirmation' ? 'border-green-500 bg-green-500/20' :
                            'border-barby-cream/40'
                        }`}>
                        {checkoutStep === 'payment' || checkoutStep === 'confirmation' ? <FiCheck className="text-green-500" /> : '1'}
                    </div>
                    <span className="hidden sm:inline">פרטי הנמען</span>
                </div>
                <div className="w-8 h-0.5 bg-barby-gold/30" />
                <div className={`flex items-center gap-2 ${checkoutStep === 'payment' ? 'text-barby-gold' : 'text-barby-cream/40'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${checkoutStep === 'payment' ? 'border-barby-gold bg-barby-gold/20' :
                        checkoutStep === 'confirmation' ? 'border-green-500 bg-green-500/20' :
                            'border-barby-cream/40'
                        }`}>
                        {checkoutStep === 'confirmation' ? <FiCheck className="text-green-500" /> : '2'}
                    </div>
                    <span className="hidden sm:inline">תשלום</span>
                </div>
                <div className="w-8 h-0.5 bg-barby-gold/30" />
                <div className={`flex items-center gap-2 ${checkoutStep === 'confirmation' ? 'text-barby-gold' : 'text-barby-cream/40'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${checkoutStep === 'confirmation' ? 'border-green-500 bg-green-500/20' : 'border-barby-cream/40'
                        }`}>
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
                            <div className="text-barby-cream font-medium flex items-center gap-2">
                                <FiGift className="text-barby-gold" />
                                גיפטקארד בארבי
                            </div>
                            <div className="text-barby-cream/60 text-sm">
                                {isForSelf ? 'לשימוש עצמי' : `לנמען: ${formData.recipientFirstName} ${formData.recipientLastName}`}
                            </div>
                            <div className="text-barby-cream/60 text-sm">תוקף: 5 שנים</div>
                        </div>
                        <div className="border-t border-barby-gold/20 pt-3 flex justify-between">
                            <span className="text-barby-cream font-medium">סה"כ:</span>
                            <span className="text-xl font-bold text-barby-gold">{formatPrice(actualAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Form - Left Side */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                    {checkoutStep === 'details' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-barby-gold flex items-center gap-2">
                                <FiUser /> {isForSelf ? 'הפרטים שלך' : 'פרטי הנמען'}
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                    label="שם פרטי"
                                    placeholder="הזן שם פרטי"
                                    value={formData.recipientFirstName}
                                    onChange={(e) => setFormData({ ...formData, recipientFirstName: e.target.value })}
                                    error={formErrors.recipientFirstName}
                                    disabled={isForSelf}
                                />
                                <Input
                                    label="שם משפחה"
                                    placeholder="הזן שם משפחה"
                                    value={formData.recipientLastName}
                                    onChange={(e) => setFormData({ ...formData, recipientLastName: e.target.value })}
                                    error={formErrors.recipientLastName}
                                    disabled={isForSelf}
                                />
                            </div>
                            <Input
                                label="אימייל"
                                type="email"
                                placeholder="email@example.com"
                                value={formData.recipientEmail}
                                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                                error={formErrors.recipientEmail}
                                dir="ltr"
                                disabled={isForSelf}
                            />
                            <Input
                                label="טלפון (אופציונלי)"
                                type="tel"
                                placeholder="0501234567"
                                value={formData.recipientPhone}
                                onChange={(e) => setFormData({ ...formData, recipientPhone: handlePhoneInput(e.target.value) })}
                                error={formErrors.recipientPhone}
                                inputMode="numeric"
                                maxLength={10}
                                dir="ltr"
                            />
                            {!isForSelf && (
                                <Textarea
                                    label="ברכה אישית (אופציונלי)"
                                    placeholder="כתוב כאן ברכה אישית למקבל המתנה..."
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            )}
                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" onClick={handleBackToSelect}>
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
                                dir="ltr"
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
                                    dir="ltr"
                                />
                                <Input
                                    label="CVV"
                                    placeholder="123"
                                    maxLength={4}
                                    value={formData.cardCvv}
                                    onChange={(e) => setFormData({ ...formData, cardCvv: handleCvvInput(e.target.value, formData.cardNumber) })}
                                    error={formErrors.cardCvv}
                                    inputMode="numeric"
                                    dir="ltr"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setCheckoutStep('details')}>
                                    <FiArrowRight className="ml-2" /> חזרה
                                </Button>
                                <Button onClick={handleSubmitPayment} className="flex-1" isLoading={isLoading}>
                                    שלם {formatPrice(actualAmount)}
                                </Button>
                            </div>
                        </div>
                    )}

                    {checkoutStep === 'confirmation' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                <FiCheck className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-barby-gold mb-4">הגיפטקארד נוצר בהצלחה!</h2>
                            <p className="text-barby-cream/80 mb-2">תודה על הרכישה!</p>
                            {isForSelf ? (
                                <p className="text-barby-cream/60 mb-6">הגיפטקארד נוסף לחשבון שלך</p>
                            ) : (
                                <p className="text-barby-cream/60 mb-6">
                                    הגיפטקארד נשלח לכתובת {formData.recipientEmail}
                                </p>
                            )}
                            {createdGiftCard && (
                                <div className="bg-barby-dark/50 rounded-lg p-6 border border-barby-gold/20 max-w-md mx-auto mb-6">
                                    <div className="text-barby-cream/60 text-sm mb-2">קוד הגיפטקארד:</div>
                                    <div className="text-2xl font-mono text-barby-gold tracking-wider mb-4" dir="ltr">
                                        {createdGiftCard.code}
                                    </div>
                                    <div className="text-barby-cream font-medium">
                                        שווי: {formatPrice(createdGiftCard.amount)}
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={() => {
                                    setCheckoutStep('select')
                                    setSelectedAmount(0)
                                    setCustomAmount('')
                                    setIsForSelf(false)
                                    setFormData({
                                        recipientFirstName: '',
                                        recipientLastName: '',
                                        recipientEmail: '',
                                        recipientPhone: '',
                                        message: '',
                                        cardNumber: '',
                                        cardExpiry: '',
                                        cardCvv: '',
                                        cardHolder: '',
                                    })
                                    setCreatedGiftCard(null)
                                }}>
                                    רכישת גיפטקארד נוסף
                                </Button>
                                <Link to="/account">
                                    <Button variant="outline">
                                        לחשבון שלי
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

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

            {/* Title Banner */}
            <section className="bg-barby-gold py-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-barby-dark text-center">
                    שובר מתנה להופעות בבארבי
                </h1>
            </section>

            {/* Gift Card Section */}
            <section className="container mx-auto px-4 pb-16">
                <div className="max-w-2xl mx-auto">
                    {/* Instructions */}
                    {checkoutStep === 'select' && (
                        <div className="text-center mb-6">
                            <p className="text-barby-gold text-lg mb-2">
                                רכשו גיפטקארד לעצמכם או שלחו מתנה ליקיריכם
                            </p>
                            <p className="text-barby-cream/70">
                                הגיפטקארד תקף לרכישת כרטיסים לכל הופעה בבארבי
                            </p>
                        </div>
                    )}

                    {/* Amount Selection or Checkout Form */}
                    {checkoutStep === 'select' ? renderAmountSelection() : renderCheckoutForm()}

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

            {/* Registration Note */}
            <section className="container mx-auto px-4 pb-12">
                <p className="text-center text-barby-cream/50 text-sm">
                    יש צורך בהרשמה בכדי לרכוש גיפטקארד, אם אינך משתמש רשום תהליך ההרשמה יערך בעת הרכישה
                </p>
            </section>
        </div>
    )
}
