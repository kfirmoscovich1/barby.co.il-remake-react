import { useState, useEffect } from 'react';
import { FiChevronUp } from 'react-icons/fi';

/**
 * Scroll to top button - appears when user scrolls down
 * Small yellow circle with arrow on the right side
 */
export function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when scrolled down 300px
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-5 right-5 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-barby-gold text-neutral-900 shadow-lg transition-all duration-300 hover:bg-barby-gold-light hover:scale-110 focus:outline-none focus:ring-2 focus:ring-barby-gold focus:ring-offset-2"
            aria-label="חזרה למעלה"
            title="חזרה למעלה"
        >
            <FiChevronUp className="h-4 w-4" strokeWidth={2.5} />
        </button>
    );
}
