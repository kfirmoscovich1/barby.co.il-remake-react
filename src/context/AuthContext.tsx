/**
 * @file AuthContext.tsx
 * @description Authentication context provider using React Context API.
 * 
 * Features:
 * - JWT-based authentication with refresh tokens
 * - Automatic token refresh before expiration
 * - User role management (user, editor, admin)
 * - Persistent sessions using HTTP-only cookies
 * 
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, isEditor, login, logout } = useAuth()
 * ```
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { User } from '@/types'
import { authApi } from '@/services/api'
import { queryKeys } from '@/services/queryClient'

// Demo user for development
const DEMO_USER: User = {
    id: 'demo-user-1',
    email: 'kfir8990@gmail.com',
    name: 'כפיר מוסקוביץ',
    role: 'admin' as const,
    passwordHash: '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
}

// Set to true to use demo user without backend
const USE_DEMO_USER = false

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    isAdmin: boolean
    isEditor: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()
    const [isInitialized, setIsInitialized] = useState(false)
    const [demoLoggedIn, setDemoLoggedIn] = useState(() => {
        return USE_DEMO_USER && localStorage.getItem('demoLoggedIn') === 'true'
    })

    // Check if we have a token on mount
    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        if (!token && !USE_DEMO_USER) {
            setIsInitialized(true)
        }
        if (USE_DEMO_USER) {
            setIsInitialized(true)
        }
    }, [])

    const { data, isLoading, isFetched } = useQuery({
        queryKey: queryKeys.auth.me,
        queryFn: authApi.me,
        enabled: !USE_DEMO_USER && !!localStorage.getItem('accessToken'),
        retry: false,
    })

    useEffect(() => {
        if (isFetched && !USE_DEMO_USER) {
            setIsInitialized(true)
        }
    }, [isFetched])

    const loginMutation = useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            authApi.login(email, password),
        onSuccess: (data) => {
            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)
            queryClient.setQueryData(queryKeys.auth.me, { user: data.user })
            // Invalidate to refetch user data
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
        },
    })

    const logoutMutation = useMutation({
        mutationFn: authApi.logout,
        onSettled: () => {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            queryClient.clear()
        },
    })

    // Use demo user or real user
    const user = USE_DEMO_USER ? (demoLoggedIn ? DEMO_USER : null) : (data?.user ?? null)
    const isAuthenticated = !!user
    const isAdmin = user?.role === 'admin'
    const isEditor = user?.role === 'editor' || isAdmin

    const login = async (email: string, password: string) => {
        if (USE_DEMO_USER) {
            // Demo login - any credentials work
            localStorage.setItem('demoLoggedIn', 'true')
            setDemoLoggedIn(true)
            return
        }
        await loginMutation.mutateAsync({ email, password })
    }

    const logout = async () => {
        if (USE_DEMO_USER) {
            localStorage.removeItem('demoLoggedIn')
            setDemoLoggedIn(false)
            return
        }
        await logoutMutation.mutateAsync()
    }

    // Show loading while checking auth
    if (!isInitialized || (!USE_DEMO_USER && isLoading && localStorage.getItem('accessToken'))) {
        return (
            <div className="min-h-screen bg-barby-black flex items-center justify-center">
                <div className="text-barby-gold animate-pulse text-xl">טוען...</div>
            </div>
        )
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading: USE_DEMO_USER ? false : (isLoading || loginMutation.isPending),
                isAuthenticated,
                isAdmin,
                isEditor,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
