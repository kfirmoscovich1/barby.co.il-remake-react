import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'destructive' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    as?: 'button' | 'span'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, as = 'button', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold focus-visible:ring-offset-2 focus-visible:ring-offset-barby-dark'

        const variants = {
            primary: 'bg-gradient-to-b from-barby-gold to-barby-gold-dark text-barby-black border-2 border-barby-gold-light shadow-vintage hover:shadow-glow-gold transform hover:-translate-y-0.5 active:translate-y-0',
            secondary: 'bg-transparent text-barby-gold border-2 border-barby-gold hover:bg-barby-gold hover:text-barby-black shadow-vintage hover:shadow-glow-gold transform hover:-translate-y-0.5 active:translate-y-0',
            danger: 'bg-gradient-to-b from-barby-red to-barby-burgundy text-barby-cream border-2 border-barby-red-light shadow-vintage hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0',
            destructive: 'bg-gradient-to-b from-barby-red to-barby-burgundy text-barby-cream border-2 border-barby-red-light shadow-vintage hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0',
            ghost: 'bg-transparent text-barby-cream hover:text-barby-gold hover:bg-barby-gold/10',
            outline: 'bg-transparent text-barby-gold border-2 border-barby-gold/50 hover:border-barby-gold hover:bg-barby-gold/10',
        }

        const sizes = {
            sm: 'px-4 py-2 text-xs',
            md: 'px-6 py-3 text-sm',
            lg: 'px-8 py-4 text-base',
        }

        const Component = as

        return (
            <Component
                ref={ref as React.Ref<HTMLButtonElement & HTMLSpanElement>}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={as === 'button' ? (disabled || isLoading) : undefined}
                aria-busy={isLoading}
                aria-disabled={disabled || isLoading}
                {...(props as React.HTMLAttributes<HTMLElement>)}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -mr-1 ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>טוען...</span>
                    </>
                ) : (
                    children
                )}
            </Component>
        )
    }
)

Button.displayName = 'Button'
