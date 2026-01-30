import { TextareaHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
    helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const generatedId = useId()
        const textareaId = id || props.name || generatedId
        const errorId = error ? `${textareaId}-error` : undefined
        const helperId = helperText && !error ? `${textareaId}-helper` : undefined
        const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={textareaId} className="block text-sm font-medium text-barby-cream mb-2">
                        {label}
                        {props.required && <span className="text-barby-red mr-1" aria-hidden="true">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={describedBy}
                    className={cn(
                        'input-vintage min-h-[120px] resize-none',
                        error && 'border-barby-red focus:border-barby-red focus:shadow-none',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p id={errorId} className="mt-1 text-sm text-barby-red" role="alert">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={helperId} className="mt-1 text-sm text-barby-cream/50">
                        {helperText}
                    </p>
                )}
            </div>
        )
    }
)

Textarea.displayName = 'Textarea'
