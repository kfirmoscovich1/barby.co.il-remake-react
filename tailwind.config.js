/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Barby.co.il original color palette
                barby: {
                    // Background colors - dark burgundy/maroon like original
                    black: '#0a0a0a',
                    dark: '#2d0a0a',       // Dark burgundy
                    darker: '#1a0505',     // Darker burgundy

                    // Gold/Yellow - original barby orange-gold
                    gold: '#ffa614',       // Main orange-gold
                    'gold-light': '#ffb84d', // Lighter orange-gold
                    'gold-dark': '#cc8400',  // Darker orange-gold

                    // Red tones - matching original background
                    red: '#6b0f0f',        // Dark red/maroon
                    'red-light': '#8b1a1a', // Lighter red
                    burgundy: '#3d0808',   // Deep burgundy for cards

                    // Accent colors
                    cream: '#f5f0e1',
                    'cream-dark': '#e6dcc5',
                },
            },
            fontFamily: {
                alef: ['Alef', 'sans-serif'],
                heebo: ['Alef', 'sans-serif'],
                frank: ['Alef', 'sans-serif'],
                sans: ['Alef', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'vintage-noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                'chandelier-glow': 'radial-gradient(ellipse at center top, rgba(255, 166, 20, 0.15) 0%, transparent 60%)',
            },
            boxShadow: {
                'glow-gold': '0 0 20px rgba(255, 166, 20, 0.3)',
                'glow-gold-lg': '0 0 40px rgba(255, 166, 20, 0.4)',
                'inner-dark': 'inset 0 2px 10px rgba(0, 0, 0, 0.5)',
                'vintage': '4px 4px 0 rgba(0, 0, 0, 0.3)',
            },
            animation: {
                'flicker': 'flicker 3s ease-in-out infinite',
                'glow-pulse': 'glowPulse 4s ease-in-out infinite',
                'slide-up': 'slideUp 0.3s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
                'shimmer': 'shimmer 2s linear infinite',
                'marquee': 'marquee 60s linear infinite',
                'marquee2': 'marquee2 60s linear infinite',
            },
            keyframes: {
                flicker: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.85' },
                    '75%': { opacity: '0.95' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(255, 166, 20, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(255, 166, 20, 0.5)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                marquee2: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0%)' },
                },
            },
            borderWidth: {
                '3': '3px',
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '112': '28rem',
                '128': '32rem',
            },
        },
    },
    plugins: [],
}
