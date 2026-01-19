import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validation'
import { useAuth } from '@/context/AuthContext'
import { Button, Input } from '@/components/common'
import { Chandelier } from '@/components/feature'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'

export function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true)
        try {
            await login(data.email, data.password)
            toast.success('התחברת בהצלחה!')
            navigate('/admin')
        } catch (error) {
            toast.error('אימייל או סיסמה שגויים')
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

            {/* Login Form Section */}
            <section className="container mx-auto px-4 pb-16">
                <div className="max-w-md mx-auto">
                    {/* Login form card */}
                    <div className="bg-barby-darker/40 border border-barby-gold/20 rounded-lg overflow-hidden hover:border-barby-gold/50 transition-all">
                        <div className="p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-barby-gold text-center mb-6">
                                התחברות לחשבון
                            </h2>

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

                                <div className="text-center">
                                    <Link
                                        to="/forgot-password"
                                        className="text-barby-cream/60 hover:text-barby-gold text-sm transition-colors underline"
                                    >
                                        שכחתי סיסמה
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    isLoading={isLoading}
                                >
                                    התחבר
                                </Button>
                            </form>

                            <div className="text-center mt-6">
                                <span className="text-barby-cream/70 text-sm">אין לך משתמש רשום?</span>
                                <Link
                                    to="/register"
                                    className="text-barby-gold hover:text-barby-gold-light text-sm mr-1 transition-colors underline"
                                >
                                    הירשם עכשיו
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
