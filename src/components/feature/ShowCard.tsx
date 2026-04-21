import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Show } from '@/types'
import { computeShowStatus } from '@/utils'
import { BsPersonStanding } from 'react-icons/bs'
import { GiWoodenChair } from 'react-icons/gi'
import { TbRotate360 } from 'react-icons/tb'
import { Chandelier } from './Chandelier'
import { MediaImage } from '@/components/common'

// Strip HTML tags from rich text for plain text display
function stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
}

// Extended Show type with optional remainingTickets field
type ShowWithStock = Show & { remainingTickets?: number }

// Format date in Hebrew - full format
function formatShowDate(dateISO: string): { day: string; date: string; fullDate: string } {
    const dateObj = new Date(dateISO)
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
    const day = days[dateObj.getDay()]
    const dayNum = dateObj.getDate().toString().padStart(2, '0')
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    const fullDate = `${dateObj.getDate()} ב${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`
    return { day: `יום ${day}`, date: `${dayNum}/${month}`, fullDate }
}

interface ShowCardProps {
    show: ShowWithStock
}

export const ShowCard = memo(function ShowCard({ show }: ShowCardProps) {
    const effectiveStatus = useMemo(() => computeShowStatus(show), [show])
    const isSoldOut = effectiveStatus === 'sold_out'
    const isCancelled = effectiveStatus === 'cancelled'
    const isLowStock = effectiveStatus === 'few_left'
    const { day, date, fullDate } = useMemo(() => formatShowDate(show.dateISO), [show.dateISO])

    // Check if show is today
    const isToday = useMemo(() => {
        const today = new Date()
        const showDate = new Date(show.dateISO)
        return today.toDateString() === showDate.toDateString()
    }, [show.dateISO])

    // Build accessible label for screen readers
    const ariaLabel = useMemo(() => {
        let label = `${show.title}`
        if (show.description) label += `, ${stripHtml(show.description)}`
        label += `. ${fullDate}, פתיחת דלתות ${show.doorsTime || 'לא צוין'}`
        if (isCancelled) label += '. ההופעה בוטלה'
        else if (isSoldOut) label += '. הכרטיסים אזלו'
        else if (isToday) label += '. ההופעה היום'
        else if (isLowStock) label += '. כרטיסים בודדים נותרו'
        if (show.is360) label += '. מופע 360'
        if (show.isStanding === false) label += '. מופע בישיבה'
        else label += '. מופע בעמידה'
        return label
    }, [show.title, show.description, fullDate, show.doorsTime, isCancelled, isSoldOut, isToday, isLowStock, show.is360, show.isStanding])

    // Cancelled or Sold out shows - still clickable but with muted style
    if ((isSoldOut && !isToday) || isCancelled) {
        return (
            <Link
                to={`/show/${show.slug || show.id}`}
                className="block bg-barby-darker/40 border border-barby-gold/20 rounded-lg overflow-hidden hover:border-barby-gold/40 transition-all"
                aria-label={ariaLabel}
            >
                {/* Show Image */}
                <div className="aspect-square overflow-hidden relative">
                    <MediaImage
                        mediaId={show.cardThumbnail || show.imageMediaId}
                        alt=""
                        variant="thumbnail"
                        className="w-full h-full object-cover"
                        fallback={
                            <div className="w-full h-full bg-barby-darker/50 flex items-center justify-center" aria-hidden="true">
                                <Chandelier size="md" animate={false} />
                            </div>
                        }
                    />

                    {/* Status badge */}
                    {isCancelled ? (
                        <div className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 text-xs font-bold rounded" aria-hidden="true">
                            בוטל
                        </div>
                    ) : (
                        <div className="absolute top-2 right-2 bg-barby-red text-barby-cream px-2 py-1 text-xs font-bold rounded" aria-hidden="true">
                            הכרטיסים אזלו!
                        </div>
                    )}

                    {/* Show type icons - standing, seated or 360 */}
                    <div className="absolute bottom-2 left-2 flex gap-1" aria-hidden="true">
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
                                <TbRotate360 className="w-5 h-5 absolute opacity-40" />
                                <span className="text-[10px] font-bold z-10">360</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Show Info - Fixed height container */}
                <div className="p-3 h-[100px] flex flex-col">
                    {/* Artist Name */}
                    <h3 className="text-sm md:text-base font-bold text-barby-gold/60 truncate">
                        {show.title}
                    </h3>

                    {/* Show Name/Description - Fixed height with or without content */}
                    <p className="text-barby-cream/50 text-xs truncate h-4 mt-1">
                        {show.description ? stripHtml(show.description) : '\u00A0'}
                    </p>

                    {/* Date & Time - Always at bottom */}
                    <div className="text-barby-cream/50 text-xs mt-auto">
                        <p>{day} | {date}</p>
                        <p>דלתות: {show.doorsTime || '--:--'}</p>
                    </div>
                </div>
            </Link>
        )
    }

    // Badge to show - priority: Sold Out (today) > Today > Low Stock
    const renderBadge = () => {
        if (isSoldOut) {
            return (
                <div className="absolute top-2 right-2 bg-barby-red text-barby-cream px-2 py-1 text-xs font-bold rounded">
                    הכרטיסים אזלו!
                </div>
            )
        }
        if (isToday) {
            return (
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 text-xs font-bold rounded animate-pulse">
                    ההופעה היום!
                </div>
            )
        }
        if (isLowStock) {
            return (
                <div className="absolute top-2 right-2 bg-barby-gold text-barby-dark px-2 py-1 text-xs font-bold rounded animate-pulse">
                    כרטיסים בודדים!
                </div>
            )
        }
        return null
    }

    return (
        <Link
            to={`/show/${show.slug || show.id}`}
            className="group block bg-barby-darker/40 border border-barby-gold/20 rounded-lg overflow-hidden hover:border-barby-gold/50 hover:bg-barby-burgundy/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barby-gold focus-visible:ring-offset-2 focus-visible:ring-offset-barby-dark"
            aria-label={ariaLabel}
        >
            {/* Show Image */}
            <div className="aspect-square overflow-hidden relative">
                <MediaImage
                    mediaId={show.cardThumbnail || show.imageMediaId}
                    alt=""
                    variant="thumbnail"
                    className="w-full h-full object-cover"
                    fallback={
                        <div className="w-full h-full bg-barby-darker/50 flex items-center justify-center" aria-hidden="true">
                            <Chandelier size="md" animate={false} />
                        </div>
                    }
                />

                {/* Status badge */}
                {renderBadge()}

                {/* Show type icons - standing, seated or 360 */}
                <div className="absolute bottom-2 left-2 flex gap-1" aria-hidden="true">
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
                            <TbRotate360 className="w-5 h-5 absolute opacity-40" />
                            <span className="text-[10px] font-bold z-10">360</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Show Info - Fixed height container */}
            <div className="p-3 h-[100px] flex flex-col">
                {/* Artist Name */}
                <h3 className="text-sm md:text-base font-bold text-barby-gold group-hover:text-barby-gold-light transition-colors truncate">
                    {show.title}
                </h3>

                {/* Show Name/Description - Fixed height with or without content */}
                <p className="text-barby-cream/70 text-xs truncate h-4 mt-1">
                    {show.description ? stripHtml(show.description) : '\u00A0'}
                </p>

                {/* Date & Time - Always at bottom */}
                <div className="text-barby-cream/60 text-xs mt-auto">
                    <p>{day} | {date}</p>
                    <p>דלתות: {show.doorsTime || '--:--'}</p>
                </div>
            </div>
        </Link>
    )
})
