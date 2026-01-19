import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BsPersonStanding } from 'react-icons/bs'
import { GiWoodenChair } from 'react-icons/gi'
import { TbRotate360 } from 'react-icons/tb'
import { FiSearch, FiX } from 'react-icons/fi'
import { Chandelier, ShowCard } from '@/components/feature'
import { NoShowsMessage, LoadingError, Skeleton } from '@/components/common'
import { publicApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { getImageUrl } from '@/utils'
import type { Show } from '@/types'

// Skeleton loader for shows grid
function ShowsSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-barby-darker/50 rounded-lg overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-3">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    )
}

// Format date in Hebrew - full format
function formatShowDate(dateISO: string): { day: string; date: string } {
    const dateObj = new Date(dateISO)
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    const day = days[dateObj.getDay()]
    const dayNum = dateObj.getDate().toString().padStart(2, '0')
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    return { day: `יום ${day}`, date: `${dayNum}/${month}` }
}

// Check if a show is today
function isToday(dateISO: string): boolean {
    const showDate = new Date(dateISO)
    const today = new Date()
    return showDate.getFullYear() === today.getFullYear() &&
        showDate.getMonth() === today.getMonth() &&
        showDate.getDate() === today.getDate()
}

// Extended Show type with stock info
type ShowWithStock = Show & { remainingTickets?: number }

// Today's featured show component
function TodayShow({ show }: { show: ShowWithStock }) {
    const isSoldOut = show.status === 'sold_out'
    const imageUrl = show.imageMediaId ? getImageUrl(show.imageMediaId) : null
    const { day, date } = formatShowDate(show.dateISO)

    // Today's show - always show "ההופעה היום!" badge, never "sold out"
    return (
        <div className={`block bg-barby-burgundy/40 border-2 ${isSoldOut ? 'border-barby-gold/30 cursor-default' : 'border-barby-gold/50'} rounded-lg overflow-hidden max-w-md mx-auto`}>
            <div className="flex flex-col sm:flex-row">
                {/* Show Image */}
                <div className="sm:w-40 md:w-48 aspect-square overflow-hidden relative flex-shrink-0">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={show.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-barby-darker/50 flex items-center justify-center">
                            <Chandelier size="md" />
                        </div>
                    )}

                    {/* Sold out badge - top right corner */}
                    {isSoldOut && (
                        <div className="absolute top-2 right-2 bg-barby-red text-white px-2 py-1 text-xs font-bold rounded">
                            הכרטיסים אזלו!
                        </div>
                    )}

                    {/* Show type icons - standing, seated or 360 */}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                        {show.isStanding === false ? (
                            <div className="bg-barby-gold text-white w-7 h-7 rounded-full flex items-center justify-center" title="מופע ישיבה">
                                <GiWoodenChair className="w-4 h-4" style={{ filter: 'drop-shadow(1px 0 0 black) drop-shadow(-1px 0 0 black) drop-shadow(0 1px 0 black) drop-shadow(0 -1px 0 black)' }} />
                            </div>
                        ) : (
                            <div className="bg-barby-gold text-white w-7 h-7 rounded-full flex items-center justify-center" title="מופע עמידה">
                                <BsPersonStanding className="w-4 h-4" style={{ filter: 'drop-shadow(1px 0 0 black) drop-shadow(-1px 0 0 black) drop-shadow(0 1px 0 black) drop-shadow(0 -1px 0 black)' }} />
                            </div>
                        )}
                        {show.is360 && (
                            <div className="bg-white text-barby-red w-7 h-7 rounded-full flex items-center justify-center relative" title="מופע 360">
                                <TbRotate360 className="w-5 h-5 absolute opacity-30" />
                                <span className="text-[10px] font-bold z-10">360</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Show Info */}
                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center">
                    <div className="mb-1">
                        <span className="bg-barby-gold text-barby-dark px-2 py-0.5 text-xs font-bold rounded-full">
                            ההופעה היום!
                        </span>
                    </div>
                    <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${isSoldOut ? 'text-barby-gold/60' : 'text-barby-gold'} mb-1`}>
                        {show.title}
                    </h2>
                    {show.description && (
                        <p className={`${isSoldOut ? 'text-barby-cream/50' : 'text-barby-cream/70'} text-xs sm:text-sm mb-1 line-clamp-2`}>
                            {show.description}
                        </p>
                    )}
                    <p className={`${isSoldOut ? 'text-barby-cream/50' : 'text-barby-cream/60'} text-xs sm:text-sm`}>
                        {day} | {date} | דלתות: {show.doorsTime}
                    </p>
                </div>
            </div>
        </div>
    )
}

export function HomePage() {
    const limit = 24
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch site settings for marquee items
    const { data: settingsData } = useQuery({
        queryKey: queryKeys.settings.public,
        queryFn: publicApi.getSettings,
        staleTime: 1000 * 60 * 15, // 15 minutes
    })
    const marqueeItems = settingsData?.settings?.marqueeItems || []

    // Use simple query instead of infinite scroll for faster initial load
    const { data: showsData, isLoading, error } = useQuery({
        queryKey: queryKeys.shows.list({ limit }),
        queryFn: () => publicApi.getShows({ page: 1, limit }),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Safely extract shows from response data
    const shows = useMemo(() => {
        if (!showsData) return []
        // Handle both possible response structures
        if (Array.isArray(showsData)) return showsData
        if (showsData.items && Array.isArray(showsData.items)) return showsData.items
        return []
    }, [showsData])

    // Filter shows by search query (title or description)
    const filteredShows = searchQuery.trim()
        ? shows.filter(show => {
            const query = searchQuery.toLowerCase().trim()
            const titleMatch = show.title?.toLowerCase().includes(query)
            const descMatch = show.description?.toLowerCase().includes(query)
            return titleMatch || descMatch
        })
        : shows

    // Find all today's shows and sort by doors time
    const todayShows = filteredShows
        .filter(show => show && show.dateISO && isToday(show.dateISO))
        .sort((a, b) => {
            // Sort by doors time (HH:MM format)
            return (a.doorsTime || '00:00').localeCompare(b.doorsTime || '00:00')
        })

    // Get current time in HH:MM format
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    // Find the next upcoming show (doors time hasn't passed yet) or the last one if all have passed
    const upcomingTodayShow = todayShows.find(show => (show.doorsTime || '00:00') > currentTime) || todayShows[todayShows.length - 1]

    // Other shows exclude all of today's shows except the featured one
    const otherShows = filteredShows
        .filter(show => show && show.dateISO)
        .filter(show =>
            !isToday(show.dateISO) || (upcomingTodayShow && show.id === upcomingTodayShow.id ? false : true)
        ).filter(show => show.id !== upcomingTodayShow?.id)

    // Handle error state
    if (error && shows.length === 0) {
        return <LoadingError onRetry={() => window.location.reload()} />
    }

    return (
        <div className="min-h-screen">
            {/* Chandelier Header */}
            <section className="relative py-6 md:py-10">
                <div className="flex justify-center">
                    <Chandelier size="xl" />
                </div>
            </section>

            {/* Info Notice - Scrolling Marquee */}
            {marqueeItems.length > 0 && (
                <section className="w-full pb-6">
                    <div className="bg-barby-darker/80 border-y border-barby-gold/30 overflow-hidden">
                        <div className="py-3">
                            <div
                                className="flex w-fit animate-marquee"
                                style={{
                                    animationDuration: `${Math.max(30, marqueeItems.length * 8)}s`
                                }}
                            >
                                {/* First copy */}
                                <div className="flex shrink-0 whitespace-nowrap text-barby-cream/90 text-sm md:text-base font-bold">
                                    {marqueeItems.map((item, index) => (
                                        <span key={`a-${index}`} className="mx-6">{item}</span>
                                    ))}
                                </div>
                                {/* Second copy for seamless loop */}
                                <div className="flex shrink-0 whitespace-nowrap text-barby-cream/90 text-sm md:text-base font-bold">
                                    {marqueeItems.map((item, index) => (
                                        <span key={`b-${index}`} className="mx-6">{item}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <style>{`
                        @keyframes marquee {
                            0% { transform: translateX(0%); }
                            100% { transform: translateX(50%); }
                        }
                        .animate-marquee {
                            animation: marquee linear infinite;
                            will-change: transform;
                        }
                    `}</style>
                </section>
            )}

            {/* Today's Show - Featured */}
            {upcomingTodayShow && !searchQuery && (
                <section className="container mx-auto px-4 pb-6">
                    <TodayShow show={upcomingTodayShow} />
                </section>
            )}

            {/* Search Bar */}
            <section className="container mx-auto px-4 pb-6">
                <div className="relative max-w-md mx-auto">
                    <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-barby-cream/50 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="חפש מופעים..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-barby-darker/80 border border-barby-gold/30 rounded-lg py-3 pr-12 pl-10 text-barby-cream placeholder:text-barby-cream/40 focus:outline-none focus:border-barby-gold/60 transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-barby-cream/50 hover:text-barby-cream transition-colors"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className="text-center text-barby-cream/60 text-sm mt-3">
                        נמצאו {filteredShows.length} תוצאות עבור "{searchQuery}"
                    </p>
                )}
            </section>

            {/* Shows Grid */}
            <section className="container mx-auto px-4 pb-16">
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="aspect-square bg-barby-darker/50 animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : shows.length === 0 ? (
                    <NoShowsMessage />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {otherShows.map((show) => (
                            <ShowCard key={show.id} show={show} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
