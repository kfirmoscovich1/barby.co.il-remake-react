import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import type { SiteSettings } from '@/types'
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaSpotify, FaWhatsapp } from 'react-icons/fa'
import { FiX } from 'react-icons/fi'
import { IconType } from 'react-icons'

const SOCIAL_ICONS: Record<string, IconType> = {
    facebook: FaFacebookF,
    instagram: FaInstagram,
    twitter: FaTwitter,
    youtube: FaYoutube,
    tiktok: FaTiktok,
    spotify: FaSpotify,
    whatsapp: FaWhatsapp,
}

const DEFAULT_SOCIAL_LINKS = [
    { platform: 'facebook', url: 'https://facebook.com/barbytlv' },
    { platform: 'instagram', url: 'https://instagram.com/barbytlv' },
]

export function Footer() {
    const [showNavigationPopup, setShowNavigationPopup] = useState(false)

    const { data } = useQuery<{ settings: SiteSettings }>({
        queryKey: queryKeys.settings.public,
        queryFn: publicApi.getSettings,
    })

    const settings = data?.settings
    const footer = settings?.footer

    // Default navigation URLs (can be overridden in admin)
    const googleMapsUrl = footer?.googleMapsUrl || 'https://www.google.com/maps/place/Barby/@32.0529,34.7513,17z'
    const wazeUrl = footer?.wazeUrl || 'https://waze.com/ul?ll=32.0529,34.7513&navigate=yes'

    return (
        <footer className="bg-barby-darker/90 backdrop-blur-sm border-t border-barby-gold/20 relative z-10" role="contentinfo">
            {/* Decorative border */}
            <div className="h-1 bg-gradient-to-r from-transparent via-barby-gold/50 to-transparent" aria-hidden="true" />

            <div className="container mx-auto px-4 py-6">
                {/* Main footer content - horizontal on desktop, stacked on mobile */}
                <div className="grid grid-cols-3 gap-4 md:flex md:flex-row md:justify-center md:items-start md:gap-16 text-center">

                    {/* About Section */}
                    <nav aria-label="קישורי אודות">
                        <h4 className="text-barby-gold font-bold mb-2 md:mb-3 text-xs md:text-sm border-b border-barby-gold/30 pb-1 md:pb-2">אודות</h4>
                        <ul className="space-y-0.5 md:space-y-1">
                            <li>
                                <Link to="/about" className="text-barby-cream/70 hover:text-barby-gold transition-colors text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold rounded">
                                    קצת עלינו
                                </Link>
                            </li>
                            <li>
                                <Link to="/archive" className="text-barby-cream/70 hover:text-barby-gold transition-colors text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold rounded">
                                    ארכיון
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Site Links Section */}
                    <nav aria-label="קישורי אתר">
                        <h4 className="text-barby-gold font-bold mb-2 md:mb-3 text-xs md:text-sm border-b border-barby-gold/30 pb-1 md:pb-2">אתר</h4>
                        <ul className="space-y-0.5 md:space-y-1">
                            <li>
                                <Link to="/terms" className="text-barby-cream/70 hover:text-barby-gold transition-colors text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold rounded">
                                    תקנון
                                </Link>
                            </li>
                            <li>
                                <Link to="/accessibility" className="text-barby-cream/70 hover:text-barby-gold transition-colors text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold rounded">
                                    נגישות
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-barby-cream/70 hover:text-barby-gold transition-colors text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold rounded">
                                    מדיניות הפרטיות
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Help Section */}
                    <div>
                        <h4 className="text-barby-gold font-bold mb-2 md:mb-3 text-xs md:text-sm border-b border-barby-gold/30 pb-1 md:pb-2">עזרה</h4>
                        <ul className="space-y-0.5 md:space-y-1">
                            <li>
                                <Link to="/contact" className="text-barby-cream/70 hover:text-barby-gold transition-colors text-xs md:text-sm">
                                    צור קשר
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-barby-cream/70 hover:text-barby-gold transition-colors text-xs md:text-sm">
                                    שאלות נפוצות
                                </Link>
                            </li>
                            <li>
                                <Link to="/unsubscribe" className="text-barby-cream/70 hover:text-barby-gold transition-colors text-xs md:text-sm">
                                    הסרה מרשימת תפוצה
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar with logo and social */}
                <div className="mt-6 pt-4 border-t border-barby-gold/10">
                    <div className="flex flex-col items-center gap-3">
                        {/* Logo image */}
                        <img
                            src="/logo.webp"
                            alt="בארבי"
                            className="h-10 md:h-12 w-auto"
                        />

                        {/* Contact info */}
                        <div className="flex flex-col items-center gap-1 text-barby-cream/60 text-xs md:text-sm">
                            <button
                                onClick={() => setShowNavigationPopup(true)}
                                className="flex items-center gap-1 hover:text-barby-gold transition-colors cursor-pointer underline-offset-2 hover:underline"
                                aria-label="פתח אפשרויות ניווט לכתובת"
                            >
                                <span>{footer?.address || 'הנמל 1, נמל יפו, תל אביב'}</span>
                            </button>
                            <a href={`tel:${footer?.phone || '03-5188123'}`} className="hover:text-barby-gold transition-colors">
                                {footer?.phone || '03-5188123'}
                            </a>
                            <a href={`mailto:${footer?.email || 'info@barby.co.il'}`} className="hover:text-barby-gold transition-colors">
                                {footer?.email || 'info@barby.co.il'}
                            </a>
                        </div>

                        {/* Navigation Popup */}
                        {showNavigationPopup && (
                            <div
                                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                                onClick={() => setShowNavigationPopup(false)}
                            >
                                <div
                                    className="bg-barby-darker border-2 border-barby-gold/50 rounded-lg p-5 max-w-xs w-full relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => setShowNavigationPopup(false)}
                                        className="absolute top-3 right-3 text-barby-cream/60 hover:text-barby-gold transition-colors"
                                        aria-label="סגור"
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>

                                    <h3 className="text-barby-gold font-bold text-center mb-4">נווט אלינו</h3>

                                    <div className="flex justify-center gap-4">
                                        <a
                                            href={googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-24 h-24 flex flex-col items-center justify-center gap-2 rounded-lg bg-barby-dark/50 hover:bg-white/10 transition-all border border-barby-gold/20 hover:border-barby-gold/50"
                                            aria-label="פתח בגוגל מפות"
                                        >
                                            <img src="/icons/google-maps.png" alt="Google Maps" className="w-10 h-10 object-contain" />
                                            <span className="text-barby-cream text-xs">Google Maps</span>
                                        </a>

                                        <a
                                            href={wazeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-24 h-24 flex flex-col items-center justify-center gap-2 rounded-lg bg-barby-dark/50 hover:bg-white/10 transition-all border border-barby-gold/20 hover:border-barby-gold/50"
                                            aria-label="פתח בוויז"
                                        >
                                            <img src="/icons/waze.webp" alt="Waze" className="w-10 h-10 object-contain" />
                                            <span className="text-barby-cream text-xs">Waze</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Social links */}
                        <div className="flex gap-2">
                            {(footer?.socialLinks?.length ? footer.socialLinks : DEFAULT_SOCIAL_LINKS).map((link, index) => {
                                const Icon = SOCIAL_ICONS[link.platform]
                                if (!Icon) return null
                                return (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-barby-dark text-barby-cream/60 hover:text-barby-gold hover:bg-barby-gold/10 transition-all border border-barby-gold/20 rounded"
                                        aria-label={link.platform}
                                    >
                                        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </a>
                                )
                            })}
                        </div>

                        {/* Copyright */}
                        <p className="text-barby-cream/40 text-xs">
                            © {new Date().getFullYear()} כל הזכויות שמורות
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
