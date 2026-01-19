import { Link } from 'react-router-dom'
import { Button } from '@/components/common'
import { Chandelier } from '@/components/feature'

export function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center py-16">
            {/* Content */}
            <section className="container mx-auto px-4 max-w-4xl">
                <div className="bg-barby-darker/40 border border-barby-gold/20 rounded-lg p-6 md:p-8 hover:border-barby-gold/50 transition-all">
                    <div className="text-center py-12">
                        <Chandelier size="md" className="mx-auto mb-6" />
                        <h2 className="text-xl font-bold text-barby-gold mb-2">404 - העמוד לא נמצא</h2>
                        <p className="text-barby-cream/60 mb-8">
                            נראה שהגעת לעמוד שלא קיים, הוסר, או שהכתובת שגויה
                        </p>
                        <Link to="/">
                            <Button size="lg">לעמוד הראשי</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
