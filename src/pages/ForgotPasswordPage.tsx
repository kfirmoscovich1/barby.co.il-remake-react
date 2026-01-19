import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@/components/common'
import { Chandelier } from '@/components/feature'
import toast from 'react-hot-toast'
import { forgotPasswordFormSchema, type ForgotPasswordFormInput } from '@/utils/validation'

export function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormInput>({
        resolver: zodResolver(forgotPasswordFormSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormInput) => {
        setIsLoading(true)
        try {
            // TODO: Implement API call to send reset code
            console.log('Sending reset code to:', data.email)
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
            setIsSubmitted(true)
            toast.success('קוד איפוס נשלח לאימייל שלך')
        } catch (error) {
            toast.error('שגיאה בשליחת קוד האיפוס')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen">
            {/* Chandelier Header */}
            <section className="relative py-6 md:py-10">
                <div className="flex justify-center">
                    <Chandelier size="xl" />
                </div>
            </section>

            {/* Forgot Password Form Section */}
            <section className="container mx-auto px-4 pb-16">
                <div className="max-w-md mx-auto">
                    {/* Form card */}
                    <div className="bg-barby-darker/40 border border-barby-gold/20 rounded-lg overflow-hidden hover:border-barby-gold/50 transition-all relative">
                        {/* Back arrow */}
                        <Link
                            to="/login"
                            className="absolute top-4 right-4 text-barby-cream/70 hover:text-barby-gold transition-colors"
                        >
                            <span className="text-xl">→</span>
                        </Link>

                        <div className="p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-barby-gold text-center mb-2">
                                איפוס סיסמה
                            </h2>
                            <p className="text-barby-cream/70 text-sm text-center mb-6">
                                אנא מלא/י את כל הפרטים
                            </p>

                            {!isSubmitted ? (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                                    <Input
                                        label="אימייל"
                                        type="email"
                                        placeholder="your@email.com"
                                        error={errors.email?.message}
                                        className="pl-10"
                                        autoComplete="off"
                                        dir="ltr"
                                        {...register('email')}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        isLoading={isLoading}
                                    >
                                        שלח קוד איפוס סיסמה
                                    </Button>
                                </form>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="text-barby-cream/80">
                                        <p>קוד איפוס נשלח לאימייל שלך.</p>
                                        <p className="text-sm text-barby-cream/60 mt-2">
                                            אנא בדוק/י את תיבת הדואר הנכנס שלך.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setIsSubmitted(false)}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        שלח שוב
                                    </Button>
                                </div>
                            )}

                            <div className="text-center mt-6">
                                <span className="text-barby-cream/70 text-sm">נזכרת בסיסמה?</span>
                                <Link
                                    to="/login"
                                    className="text-barby-gold hover:text-barby-gold-light text-sm mr-1 transition-colors underline"
                                >
                                    התחבר עכשיו
                                </Link>
                            </div>
                        </div>
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
