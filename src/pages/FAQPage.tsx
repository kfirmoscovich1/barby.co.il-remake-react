import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'
import { PageSkeleton, NoFAQsMessage } from '@/components/common'
import { Chandelier } from '@/components/feature'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import type { FAQItem } from '@/types'

function FAQAccordion({ faq }: { faq: FAQItem }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border border-barby-gold/30 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-right bg-barby-darker/50 hover:bg-barby-darker/70 transition-colors"
            >
                <span className="font-bold text-barby-cream">{faq.question}</span>
                {isOpen ? (
                    <FiChevronUp className="w-5 h-5 text-barby-gold flex-shrink-0" />
                ) : (
                    <FiChevronDown className="w-5 h-5 text-barby-gold flex-shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="p-4 bg-barby-dark/50 border-t border-barby-gold/20">
                    <p className="text-barby-cream/80 whitespace-pre-wrap leading-relaxed">{faq.answer}</p>
                </div>
            )}
        </div>
    )
}

export function FAQPage() {
    const { data, isLoading } = useQuery({
        queryKey: queryKeys.faq.list,
        queryFn: publicApi.getFAQs,
    })

    if (isLoading) {
        return <PageSkeleton />
    }

    const faqs = data?.faqs || []

    // Group FAQs by category
    const groupedFAQs = faqs.reduce((acc, faq) => {
        const category = faq.category || 'כללי'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(faq)
        return acc
    }, {} as Record<string, FAQItem[]>)

    const categories = Object.keys(groupedFAQs).sort()

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
                    שאלות נפוצות
                </h1>
            </section>

            {/* FAQ Content */}
            <section className="container mx-auto px-4 pb-16 max-w-4xl">
                <div className="bg-barby-darker/40 border border-barby-gold/20 rounded-lg p-6 md:p-8 hover:border-barby-gold/50 transition-all">
                    {faqs.length === 0 ? (
                        <NoFAQsMessage />
                    ) : categories.length === 1 ? (
                        // Single category - no headers
                        <div className="space-y-3">
                            {faqs.map((faq) => (
                                <FAQAccordion key={faq.id} faq={faq} />
                            ))}
                        </div>
                    ) : (
                        // Multiple categories
                        <div className="space-y-8">
                            {categories.map((category) => (
                                <div key={category}>
                                    <h2 className="text-xl font-frank font-bold text-barby-gold mb-4 border-b border-barby-gold/30 pb-2">
                                        {category}
                                    </h2>
                                    <div className="space-y-3">
                                        {groupedFAQs[category].map((faq) => (
                                            <FAQAccordion key={faq.id} faq={faq} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
