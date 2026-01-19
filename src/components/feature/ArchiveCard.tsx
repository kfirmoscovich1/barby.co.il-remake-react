import type { Show } from '@/types'
import { BsPersonStanding } from 'react-icons/bs'
import { GiWoodenChair } from 'react-icons/gi'
import { TbRotate360 } from 'react-icons/tb'
import { Chandelier } from './Chandelier'
import { getImageUrl } from '@/utils'

// Format date in Hebrew - full format
function formatShowDate(dateISO: string): { day: string; date: string } {
    const dateObj = new Date(dateISO)
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    const day = days[dateObj.getDay()]
    const dayNum = dateObj.getDate().toString().padStart(2, '0')
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    return { day: `יום ${day}`, date: `${dayNum}/${month}` }
}

interface ArchiveCardProps {
    show: Show
}

export function ArchiveCard({ show }: ArchiveCardProps) {
    const imageUrl = show.imageMediaId ? getImageUrl(show.imageMediaId) : null
    const { day, date } = formatShowDate(show.dateISO)

    return (
        <div className="block bg-barby-darker/40 border border-barby-gold/20 rounded-lg overflow-hidden cursor-default">
            {/* Show Image */}
            <div className="aspect-square overflow-hidden relative">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={show.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-barby-darker/50 flex items-center justify-center">
                        <Chandelier size="md" animate={false} />
                    </div>
                )}

                {/* Archive badge */}
                <div className="absolute top-2 right-2 bg-barby-dark text-barby-cream/70 px-2 py-1 text-xs font-bold rounded">
                    ארכיון
                </div>

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
                            <TbRotate360 className="w-5 h-5 absolute opacity-40" />
                            <span className="text-[10px] font-bold z-10">360</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Show Info */}
            <div className="p-3 space-y-1">
                {/* Artist Name */}
                <h3 className="text-sm md:text-base font-bold text-barby-gold truncate">
                    {show.title}
                </h3>

                {/* Show Name/Description */}
                {show.description && (
                    <p className="text-barby-cream/70 text-xs truncate">
                        {show.description}
                    </p>
                )}

                {/* Date & Time */}
                <div className="text-barby-cream/60 text-xs">
                    <p>{day} | {date}</p>
                    <p>דלתות: {show.doorsTime}</p>
                </div>
            </div>
        </div>
    )
}
