/**
 * @file AuthContext.tsx
 * @description Authentication context provider using Firebase Auth.
 *
 * Features:
 * - Firebase Auth with email/password
 * - User profile from Firestore 'users' collection
 * - Automatic auth state tracking via onAuthStateChanged
 * - User role management (editor, admin)
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useQueryClient } from '@tanstack/react-query'
import { auth, db } from '@/lib/firebase'
import type { User } from '@/types'

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

async function getOrCreateUserDoc(firebaseUser: { uid: string; email: string | null; displayName: string | null }): Promise<User | null> {
    const userDocRef = doc(db, 'users', firebaseUser.uid)
    let userDoc = await getDoc(userDocRef)

    // Auto-create Firestore user document if it doesn't exist
    if (!userDoc.exists()) {
        const newUserData = {
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
            email: firebaseUser.email || '',
            role: 'viewer',
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }
        await setDoc(userDocRef, newUserData)
        userDoc = await getDoc(userDocRef)
    }

    const data = userDoc.data()!

    // Block deactivated users
    if (data.isActive === false) {
        return null
    }

    return {
        id: firebaseUser.uid,
        email: data.email || firebaseUser.email || '',
        name: data.name || '',
        phone: data.phone || '',
        role: data.role || 'viewer',
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userProfile = await getOrCreateUserDoc(firebaseUser)
                    if (!userProfile) {
                        // User is deactivated — sign them out
                        await firebaseSignOut(auth)
                        setUser(null)
                    } else {
                        setUser(userProfile)
                    }
                } catch {
                    setUser(null)
                }
            } else {
                setUser(null)
                queryClient.clear()
            }
            setIsLoading(false)
        })

        return unsubscribe
    }, [queryClient])

    const login = async (email: string, password: string) => {
        const credential = await signInWithEmailAndPassword(auth, email, password)
        const userProfile = await getOrCreateUserDoc(credential.user)
        if (!userProfile) {
            await firebaseSignOut(auth)
            throw new Error('החשבון שלך הושבת. פנה למנהל המערכת.')
        }
        setUser(userProfile)
    }

    const logout = async () => {
        await firebaseSignOut(auth)
        queryClient.clear()
    }

    const isAuthenticated = !!user
    const isAdmin = user?.role === 'admin'
    const isEditor = user?.role === 'editor' || isAdmin

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
