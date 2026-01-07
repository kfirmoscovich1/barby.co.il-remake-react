import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Chandelier } from '@/components/feature'
import { Input, Button } from '@/components/common'
import { emailSchema, idNumberSchema } from '@/utils/validation'

const unsubscribeSchema = z.object({
    email: emailSchema,
    idNumber: idNumberSchema,
})

type UnsubscribeForm = z.infer<typeof unsubscribeSchema>

export function UnsubscribePage() {
    const [isSubmitted, setIsSubmitted] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UnsubscribeForm>({
        resolver: zodResolver(unsubscribeSchema),
    })

    const onSubmit = async (data: UnsubscribeForm) => {
        // TODO: Implement actual unsubscribe API call
        console.log('Unsubscribe:', data.email, data.idNumber)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSubmitted(true)
    }

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
                    הסרה מרשימת תפוצה
                </h1>
            </section>

            {/* Unsubscribe Form */}
            <section className="container mx-auto px-4 pb-16 max-w-md">
                <div className="bg-barby-darker/40 border border-barby-gold/20 rounded-lg p-6 md:p-8">

                    {isSubmitted ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-barby-gold/20 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-barby-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-barby-gold">הבקשה נשלחה בהצלחה</h2>
                            <p className="text-barby-cream/70">
                                כתובת האימייל שלך תוסר מרשימת התפוצה בהקדם.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-barby-cream/70 text-center mb-6 text-sm">
                                הזינו את הפרטים להסרה מרשימת התפוצה
                            </p>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <Input
                                    label="כתובת אימייל"
                                    type="email"
                                    placeholder="your@email.com"
                                    error={errors.email?.message}
                                    dir="ltr"
                                    className="text-left"
                                    {...register('email')}
                                />

                                <Input
                                    label="תעודת זהות"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="123456789"
                                    error={errors.idNumber?.message}
                                    dir="ltr"
                                    className="text-left"
                                    maxLength={9}
                                    {...register('idNumber')}
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'שולח...' : 'הסרה מהרשימה'}
                                </Button>
                            </form>

                            {/* Alternative Contact */}
                            <div className="mt-8 pt-6 border-t border-barby-gold/20 text-center">
                                <p className="text-barby-cream/60 text-sm mb-2">
                                    בנוסף להסרה מרשימת הדיוור, ניתן לשלוח אלינו אימייל לכתובת:
                                </p>
                                <a
                                    href="mailto:barby@barbycs.com"
                                    className="text-barby-gold hover:text-barby-gold-light transition-colors font-bold"
                                >
                                    barby@barbycs.com
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    )
}
