import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@/components/common'
import { Chandelier } from '@/components/feature'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { registerFormSchema, type RegisterFormInput } from '@/utils/validation'

export function RegisterPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormInput>({
        resolver: zodResolver(registerFormSchema),
    })

    const onSubmit = async (data: RegisterFormInput) => {
        setIsLoading(true)
        try {
            // TODO: Implement API call to register user
            console.log('Registering user:', data)
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
            toast.success('נרשמת בהצלחה!')
            navigate('/login')
        } catch (error) {
            toast.error('שגיאה בהרשמה')
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

            {/* Register Form Section */}
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
                                רישום משתמש חדש
                            </h2>
                            <p className="text-barby-cream/70 text-sm text-center mb-6">
                                אנא מלא/י את כל הפרטים
                            </p>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                                <Input
                                    label="שם פרטי"
                                    type="text"
                                    placeholder="ישראל"
                                    error={errors.firstName?.message}
                                    autoComplete="off"
                                    {...register('firstName')}
                                />

                                <Input
                                    label="שם משפחה"
                                    type="text"
                                    placeholder="ישראלי"
                                    error={errors.lastName?.message}
                                    autoComplete="off"
                                    {...register('lastName')}
                                />

                                <Input
                                    label="תעודת זהות"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="123456789"
                                    error={errors.idNumber?.message}
                                    autoComplete="off"
                                    dir="ltr"
                                    onKeyDown={(e) => {
                                        if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
                                            e.preventDefault()
                                        }
                                    }}
                                    {...register('idNumber')}
                                />

                                <Input
                                    label="מספר נייד"
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="0501234567"
                                    error={errors.phone?.message}
                                    autoComplete="off"
                                    dir="ltr"
                                    onKeyDown={(e) => {
                                        if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
                                            e.preventDefault()
                                        }
                                    }}
                                    {...register('phone')}
                                />

                                <Input
                                    label="אימייל"
                                    type="email"
                                    placeholder="your@email.com"
                                    error={errors.email?.message}
                                    autoComplete="off"
                                    dir="ltr"
                                    {...register('email')}
                                />

                                <div className="relative">
                                    <Input
                                        label="סיסמה"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        error={errors.password?.message}
                                        className="pl-10"
                                        autoComplete="new-password"
                                        dir="ltr"
                                        {...register('password')}
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

                                <Input
                                    label="אימות סיסמה"
                                    type="password"
                                    placeholder="••••••••"
                                    error={errors.confirmPassword?.message}
                                    autoComplete="new-password"
                                    dir="ltr"
                                    {...register('confirmPassword')}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    isLoading={isLoading}
                                >
                                    הרשמה
                                </Button>
                            </form>

                            <div className="text-center mt-6">
                                <span className="text-barby-cream/70 text-sm">כבר יש לך חשבון?</span>
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
