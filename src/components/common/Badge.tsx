import { cn } from '@/utils'

interface BadgeProps {
    children: React.ReactNode
    variant?: 'gold' | 'red' | 'green' | 'gray'
    className?: string
}

export function Badge({ children, variant = 'gold', className }: BadgeProps) {
    const variants = {
        gold: 'bg-barby-gold text-barby-black',
        red: 'bg-barby-red text-barby-cream',
        green: 'bg-green-600 text-white',
        gray: 'bg-barby-dark text-barby-cream/70',
    }

    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase tracking-wider',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    )
}
