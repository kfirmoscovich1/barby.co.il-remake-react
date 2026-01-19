import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    helperText?: string
    options: Array<{ value: string; label: string }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, helperText, options, id, ...props }, ref) => {
        const selectId = id || props.name

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-barby-cream mb-2">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={cn(
                        'input-vintage appearance-none cursor-pointer',
                        'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23c9a227\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")]',
                        'bg-[length:1.5rem] bg-[right_0.5rem_center] bg-no-repeat',
                        'pl-10',
                        error && 'border-barby-red focus:border-barby-red focus:shadow-none',
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1 text-sm text-barby-red">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-barby-cream/50">{helperText}</p>
                )}
            </div>
        )
    }
)

Select.displayName = 'Select'
