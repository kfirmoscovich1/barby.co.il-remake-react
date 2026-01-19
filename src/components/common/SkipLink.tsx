// Skip to main content link for keyboard accessibility
export function SkipLink() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-barby-gold focus:text-barby-dark focus:px-4 focus:py-2 focus:rounded focus:font-bold"
        >
            דלג לתוכן הראשי
        </a>
    )
}
