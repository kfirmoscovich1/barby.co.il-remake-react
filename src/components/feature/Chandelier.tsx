import { cn } from '@/utils'

interface ChandelierProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    animate?: boolean
}

export function Chandelier({ size = 'md', className, animate = true }: ChandelierProps) {
    const sizeClasses = {
        sm: 'w-16 h-10',
        md: 'w-32 h-20',
        lg: 'w-48 h-32',
        xl: 'w-64 h-44',
    }

    return (
        <div
            className={cn(
                'relative',
                sizeClasses[size],
                animate && 'animate-flicker',
                className
            )}
        >
            <img
                src="/chandelier.webp"
                alt="שנדליר בארבי"
                className="w-full h-full object-contain"
            />
        </div>
    )
}
