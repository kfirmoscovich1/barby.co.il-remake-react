import { InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const generatedId = useId()
        const inputId = id || props.name || generatedId
        const errorId = error ? `${inputId}-error` : undefined
        const helperId = helperText && !error ? `${inputId}-helper` : undefined
        const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-barby-cream mb-2">
                        {label}
                        {props.required && <span className="text-barby-red mr-1" aria-hidden="true">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={describedBy}
                    className={cn(
                        'input-vintage',
                        error && 'border-barby-red focus:border-barby-red focus:shadow-none',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p id={errorId} className="mt-1 text-sm text-orange-400 font-medium" role="alert">
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

Input.displayName = 'Input'
