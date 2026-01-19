import { Link } from 'react-router-dom'
import { Button } from '@/components/common'
import { Chandelier } from '@/components/feature'

// Simple inline empty content message - for use inside cards/sections
interface EmptyContentProps {
    title: string
    message: string
}

export function EmptyContent({ title, message }: EmptyContentProps) {
    return (
        <div className="text-center py-12">
            <Chandelier size="md" className="mx-auto mb-6" />
            <h2 className="text-xl font-bold text-barby-gold mb-2">{title}</h2>
            <p className="text-barby-cream/60">{message}</p>
        </div>
    )
}

// Card wrapper with consistent styling for empty content
interface EmptyContentCardProps {
    title: string
    message: string
}

export function EmptyContentCard({ title, message }: EmptyContentCardProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-barby-darker/40 border border-barby-gold/20 rounded-lg p-6 md:p-8 hover:border-barby-gold/50 transition-all">
                <EmptyContent title={title} message={message} />
            </div>
        </div>
    )
}

// Pre-configured empty content messages
export function NoFAQsMessage() {
    return <EmptyContent title="אין שאלות עדיין" message="השאלות הנפוצות יתעדכנו בקרוב" />
}

export function NoPageContentMessage() {
    return <EmptyContent title="העמוד בבנייה" message="התוכן של עמוד זה עדיין לא זמין. אנחנו עובדים על זה!" />
}

export function NoShowsContentMessage() {
    return <EmptyContentCard title="אין הופעות כרגע" message="עדיין לא פורסמו הופעות חדשות. חזרו אלינו בקרוב!" />
}

export function NoArchiveContentMessage() {
    return <EmptyContentCard title="אין הופעות בארכיון" message="עדיין לא נוספו הופעות לארכיון" />
}

export function NoResultsMessage({ query }: { query?: string }) {
    return <EmptyContent title="לא נמצאו תוצאות" message={query ? `לא מצאנו תוצאות עבור "${query}"` : 'נסו לחפש עם מילות מפתח אחרות'} />
}

interface EmptyStateProps {
    title?: string
    message?: string
    icon?: 'chandelier' | 'music' | 'search' | 'error' | 'lock' | 'maintenance'
    showHomeButton?: boolean
    showShowsButton?: boolean
    children?: React.ReactNode
}

export function EmptyState({
    title = 'אין תוכן להצגה',
    message = 'התוכן שחיפשת אינו זמין כרגע',
    icon = 'chandelier',
    showHomeButton = true,
    showShowsButton = false,
    children,
}: EmptyStateProps) {
    const renderIcon = () => {
        switch (icon) {
            case 'chandelier':
                return <Chandelier size="lg" className="mx-auto mb-6" />
            case 'music':
                return (
                    <svg className="w-20 h-20 mx-auto mb-6 text-barby-gold/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                )
            case 'search':
                return (
                    <svg className="w-20 h-20 mx-auto mb-6 text-barby-gold/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                )
            case 'error':
                return (
                    <svg className="w-20 h-20 mx-auto mb-6 text-barby-red/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                )
            case 'lock':
                return (
                    <svg className="w-20 h-20 mx-auto mb-6 text-barby-gold/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                )
            case 'maintenance':
                return (
                    <svg className="w-20 h-20 mx-auto mb-6 text-barby-gold/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                )
        }
    }

    return (
        <div className="min-h-[50vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                {renderIcon()}

                <h2 className="text-2xl md:text-3xl font-frank font-bold text-barby-gold mb-4">
                    {title}
                </h2>

                <p className="text-barby-cream/60 mb-8 leading-relaxed">
                    {message}
                </p>

                {children}

                {(showHomeButton || showShowsButton) && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {showHomeButton && (
                            <Link to="/">
                                <Button>לעמוד הראשי</Button>
                            </Link>
                        )}
                        {showShowsButton && (
                            <Link to="/shows">
                                <Button variant="secondary">להופעות</Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// Pre-configured empty states for common scenarios
export function NoShowsMessage() {
    return (
        <EmptyState
            title="אין הופעות כרגע"
            message="עדיין לא פורסמו הופעות חדשות. חזרו אלינו בקרוב!"
            icon="music"
            showHomeButton={false}
        />
    )
}

export function NoArchiveMessage() {
    return (
        <EmptyState
            title="אין הופעות בארכיון"
            message="עדיין לא נוספו הופעות לארכיון"
            icon="music"
            showHomeButton={true}
        />
    )
}

export function NoSearchResults({ query }: { query?: string }) {
    return (
        <EmptyState
            title="לא נמצאו תוצאות"
            message={query ? `לא מצאנו תוצאות עבור "${query}"` : 'נסו לחפש עם מילות מפתח אחרות'}
            icon="search"
            showHomeButton={false}
        />
    )
}

export function PageNotAvailable({ title, description }: { title?: string; description?: string } = {}) {
    return (
        <EmptyState
            title={title || "העמוד לא זמין"}
            message={description || "התוכן שחיפשת אינו זמין כרגע. נסו שוב מאוחר יותר"}
            icon="error"
            showHomeButton={true}
        />
    )
}

export function AccessDenied() {
    return (
        <EmptyState
            title="אין הרשאה"
            message="אין לך הרשאה לצפות בתוכן זה"
            icon="lock"
            showHomeButton={true}
        />
    )
}

export function MaintenanceMode() {
    return (
        <EmptyState
            title="האתר בתחזוקה"
            message="אנחנו מבצעים שדרוגים באתר. נחזור בקרוב!"
            icon="maintenance"
            showHomeButton={false}
        />
    )
}

export function LoadingError({ onRetry }: { onRetry?: () => void }) {
    return (
        <EmptyState
            title="שגיאה בטעינה"
            message="משהו השתבש בזמן טעינת התוכן"
            icon="error"
            showHomeButton={true}
        >
            {onRetry && (
                <Button onClick={onRetry} variant="secondary" className="mb-4">
                    נסה שוב
                </Button>
            )}
        </EmptyState>
    )
}
