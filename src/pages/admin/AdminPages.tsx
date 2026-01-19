import { Link } from 'react-router-dom'
import type { Page } from '@/types'

const PAGE_LABELS: Record<Page['key'], string> = {
    'about': 'אודות',
    'terms': 'תנאי שימוש',
    'accessibility': 'הצהרת נגישות',
    'privacy': 'מדיניות פרטיות',
    'contact': 'צור קשר',
    'mailing-list': 'הסרה מרשימת תפוצה',
}

const PAGE_ROUTES: Record<Page['key'], string> = {
    'about': '/about',
    'terms': '/terms',
    'accessibility': '/accessibility',
    'privacy': '/privacy',
    'contact': '/contact',
    'mailing-list': '/unsubscribe',
}

// Static list of all pages
const ALL_PAGES: Page['key'][] = ['about', 'terms', 'accessibility', 'privacy', 'contact', 'mailing-list']

export function AdminPages() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-frank font-bold text-barby-gold">עמודים</h1>
                    <p className="text-barby-cream/60">ניהול עמודי תוכן קבועים</p>
                </div>
            </div>

            {/* Pages list */}
            <div className="card-vintage overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-barby-dark">
                            <tr>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">כותרת</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">מזהה</th>
                                <th className="text-right p-4 text-barby-cream/60 font-medium">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-barby-gold/10">
                            {ALL_PAGES.map((pageKey) => (
                                <tr key={pageKey} className="hover:bg-barby-gold/5 transition-colors">
                                    <td className="p-4 font-medium text-barby-cream">
                                        {PAGE_LABELS[pageKey]}
                                    </td>
                                    <td className="p-4 text-barby-cream/60 font-mono text-sm">{pageKey}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={PAGE_ROUTES[pageKey]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-barby-cream/60 hover:text-barby-gold transition-colors"
                                                title="צפייה בעמוד"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                            <Link
                                                to={`/admin/pages/${pageKey}`}
                                                className="p-2 text-barby-cream/60 hover:text-barby-gold transition-colors"
                                                title="עריכה"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info note */}
            <div className="card-vintage p-4 text-barby-cream/60 text-sm">
                <p>
                    <strong className="text-barby-gold">הערה:</strong> עמודים אלה הם עמודי תוכן קבועים של האתר.
                    לא ניתן להוסיף או למחוק עמודים, רק לערוך את תוכנם.
                </p>
            </div>
        </div>
    )
}
