import type { ReactNode } from 'react'

interface VisuallyHiddenProps {
    children: ReactNode
    as?: 'span' | 'div' | 'label'
}

// Screen reader only text - hidden visually but available to assistive technology
export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
    return (
        <Component className="sr-only">
            {children}
        </Component>
    )
}
