import { Component, type ReactNode } from 'react'
import { Button } from './Button'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        // Here you could send to error reporting service like Sentry
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div
                    className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="text-6xl mb-4">😵</div>
                    <h2 className="text-xl font-bold text-barby-gold mb-2">
                        אופס! משהו השתבש
                    </h2>
                    <p className="text-barby-cream/70 mb-4 max-w-md">
                        נתקלנו בבעיה בלתי צפויה. אנא נסו לרענן את הדף או לחזור לדף הבית.
                    </p>
                    {import.meta.env.DEV && this.state.error && (
                        <pre className="text-xs text-barby-red bg-barby-darker p-4 rounded mb-4 max-w-full overflow-auto">
                            {this.state.error.message}
                        </pre>
                    )}
                    <div className="flex gap-3">
                        <Button onClick={this.handleReset}>
                            נסה שוב
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = '/'}>
                            חזור לדף הבית
                        </Button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
