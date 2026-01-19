import { useParams, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { PageSkeleton, NoPageContentMessage } from '@/components/common'
import { Chandelier } from '@/components/feature'

// Inline message component for when content is not available
function ContentNotAvailable({ title = 'התוכן לא זמין', message = 'התוכן שחיפשת אינו זמין כרגע' }: { title?: string; message?: string }) {
    return (
        <div className="min-h-screen">
            <section className="relative py-6 md:py-10">
                <div className="flex justify-center">
                    <Chandelier size="xl" />
                </div>
            </section>
            <section className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-frank font-bold text-barby-gold mb-3">{title}</h2>
                    <p className="text-barby-cream/60">{message}</p>
                </div>
            </section>
        </div>
    )
}

export function PageContent() {
    const { slug: paramSlug } = useParams<{ slug: string }>()
    const location = useLocation()

    // Get slug from params or from path (for /contact, /about routes)
    const slug = paramSlug || location.pathname.slice(1) // remove leading /

    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.pages.detail(slug),
        queryFn: () => publicApi.getPage(slug),
        enabled: !!slug,
    })

    if (isLoading) {
        return <PageSkeleton />
    }

    const page = data?.page

    // No page found (error or missing data)
    if (error || !page) {
        return (
            <ContentNotAvailable
                title="העמוד לא נמצא"
                message="התוכן שחיפשת אינו זמין כרגע. נסו שוב מאוחר יותר"
            />
        )
    }

    const hasContent = page.contentRichText && page.contentRichText.trim() !== '' && page.contentRichText !== '<p></p>'
    const hasPdf = !!page.pdfUrl

    // Page exists but has no content and no PDF
    if (!hasContent && !hasPdf) {
        return (
            <div className="min-h-screen">
                {/* Chandelier Header */}
                <section className="relative py-6 md:py-10">
                    <div className="flex justify-center">
                        <Chandelier size="xl" />
                    </div>
                </section>

                {/* Title Banner */}
                <section className="bg-barby-gold py-4 mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-barby-dark text-center">
                        {page.title}
                    </h1>
                </section>

                <section className="container mx-auto px-4 pb-16 max-w-4xl">
                    <div className="bg-barby-darker/40 border border-barby-gold/20 rounded-lg p-6 md:p-8 hover:border-barby-gold/50 transition-all">
                        <NoPageContentMessage />
                    </div>
                </section>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {/* Chandelier Header */}
            <section className="relative py-6 md:py-10">
                <div className="flex justify-center">
                    <Chandelier size="xl" />
                </div>
            </section>

            {/* Title Banner */}
            <section className="bg-barby-gold py-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-barby-dark text-center">
                    {page.title}
                </h1>
            </section>

            {/* Content */}
            <section className="container mx-auto px-4 pb-16 max-w-4xl">
                {/* PDF Viewer */}
                {hasPdf && (
                    <div className="mb-8">
                        <iframe
                            src={page.pdfUrl}
                            className="w-full h-[80vh] rounded-lg border border-barby-gold/20"
                            title={page.title}
                        />
                    </div>
                )}

                {/* Rich Text Content */}
                {hasContent && (
                    <div className="bg-barby-darker/40 border border-barby-gold/20 rounded-lg p-6 md:p-8 hover:border-barby-gold/50 transition-all">
                        <div
                            className="page-content"
                            dangerouslySetInnerHTML={{ __html: page.contentRichText }}
                        />
                    </div>
                )}
            </section>
        </div>
    )
}
