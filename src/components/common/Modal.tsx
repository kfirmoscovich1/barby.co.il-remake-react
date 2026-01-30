import { useEffect, useRef, ReactNode } from 'react'
import { cn } from '@/utils'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.body.style.overflow = 'hidden'
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.body.style.overflow = ''
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    }

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose()
            }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

            {/* Modal */}
            <div
                className={cn(
                    'relative w-full bg-barby-darker border-2 border-barby-gold/30 shadow-glow-gold animate-slide-up',
                    sizes[size]
                )}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-4 border-b border-barby-gold/20">
                        <h2 className="text-lg font-bold text-barby-gold">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1 text-barby-cream/60 hover:text-barby-gold transition-colors"
                            aria-label="סגור"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-4">{children}</div>
            </div>
        </div>
    )
}
