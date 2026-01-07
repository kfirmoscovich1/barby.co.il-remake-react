import { ReactNode } from 'react'
import { cn } from '@/utils'

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
    return (
        <div
            className={cn(
                'card-vintage p-4',
                hover && 'transition-all duration-300 hover:border-barby-gold/50 hover:shadow-glow-gold cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    )
}

interface CardHeaderProps {
    children: ReactNode
    className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={cn('mb-4 pb-4 border-b border-barby-gold/20', className)}>
            {children}
        </div>
    )
}

interface CardTitleProps {
    children: ReactNode
    className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3 className={cn('text-lg font-bold text-barby-gold', className)}>
            {children}
        </h3>
    )
}

interface CardContentProps {
    children: ReactNode
    className?: string
}

export function CardContent({ children, className }: CardContentProps) {
    return <div className={cn('', className)}>{children}</div>
}

interface CardFooterProps {
    children: ReactNode
    className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div className={cn('mt-4 pt-4 border-t border-barby-gold/20', className)}>
            {children}
        </div>
    )
}
