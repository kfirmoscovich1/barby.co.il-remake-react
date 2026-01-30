import { Link } from 'react-router-dom'
import type { Show } from '@/types'
import { BsPersonStanding } from 'react-icons/bs'
import { GiWoodenChair } from 'react-icons/gi'
import { TbRotate360 } from 'react-icons/tb'
import { Chandelier } from './Chandelier'
import { getImageUrl } from '@/utils'

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

export function ShowCard({ show }: ShowCardProps) {
    const isSoldOut = show.status === 'sold_out'
    const isLowStock = !isSoldOut && (show.status === 'few_left' || (show.remainingTickets !== undefined && show.remainingTickets <= 20))
    const imageUrl = getImageUrl(show.imageMediaId)
    const { day, date, fullDate } = formatShowDate(show.dateISO)

    // Check if show is today
    const today = new Date()
    const showDate = new Date(show.dateISO)
    const isToday = today.toDateString() === showDate.toDateString()

    // Build accessible label for screen readers
    const getAriaLabel = () => {
        let label = `${show.title}`
        if (show.description) label += `, ${show.description}`
        label += `. ${fullDate}, פתיחת דלתות ${show.doorsTime || 'לא צוין'}`
        if (isSoldOut) label += '. הכרטיסים אזלו'
        else if (isToday) label += '. ההופעה היום'
        else if (isLowStock) label += '. כרטיסים בודדים נותרו'
        if (show.is360) label += '. מופע 360'
        if (show.isStanding === false) label += '. מופע בישיבה'
        else label += '. מופע בעמידה'
        return label
    }

    // Sold out shows are not clickable (unless it's today's show)
    if (isSoldOut && !isToday) {
        return (
            <article
                className="block bg-barby-darker/40 border border-barby-gold/20 rounded-lg overflow-hidden cursor-default"
                aria-label={getAriaLabel()}
            >
                {/* Show Image */}
                <div className="aspect-square overflow-hidden relative">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-barby-darker/50 flex items-center justify-center" aria-hidden="true">
                            <Chandelier size="md" animate={false} />
                        </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-2 right-2 bg-barby-red text-barby-cream px-2 py-1 text-xs font-bold rounded" aria-hidden="true">
                        הכרטיסים אזלו!
                    </div>

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
                        {show.description || '\u00A0'}
                    </p>

                    {/* Date & Time - Always at bottom */}
                    <div className="text-barby-cream/50 text-xs mt-auto">
                        <p>{day} | {date}</p>
                        <p>דלתות: {show.doorsTime || '--:--'}</p>
                    </div>
                </div>
            </article>
        )
    }

    // Badge to show - priority: Today > Low Stock
    const renderBadge = () => {
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
            aria-label={getAriaLabel()}
        >
            {/* Show Image */}
            <div className="aspect-square overflow-hidden relative">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-barby-darker/50 flex items-center justify-center" aria-hidden="true">
                        <Chandelier size="md" animate={false} />
                    </div>
                )}

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
                    {show.description || '\u00A0'}
                </p>

                {/* Date & Time - Always at bottom */}
                <div className="text-barby-cream/60 text-xs mt-auto">
                    <p>{day} | {date}</p>
                    <p>דלתות: {show.doorsTime || '--:--'}</p>
                </div>
            </div>
        </Link>
    )
}
