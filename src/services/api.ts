/**
 * @file api.ts
 * @description API service layer using Firebase Firestore and Auth.
 *
 * Replaces the previous REST API backend with direct Firebase SDK calls.
 * Maintains the same exported interface so all consuming components work unchanged.
 */

import {
    collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit as firestoreLimit, startAfter,
    serverTimestamp, Timestamp, runTransaction, writeBatch,
    setDoc, type DocumentData, type QueryConstraint
} from 'firebase/firestore'
import {
    signInWithEmailAndPassword, signOut,
    updatePassword, reauthenticateWithCredential, EmailAuthProvider,
    createUserWithEmailAndPassword, getAuth as getFirebaseAuth
} from 'firebase/auth'
import { initializeApp, deleteApp } from 'firebase/app'
import { db, auth } from '@/lib/firebase'
import type {
    Show, Page, SiteSettings, User, Media, AuditLog,
    PaginatedResponse, FAQItem, GiftCard, CreateGiftCardRequest,
    ValidateGiftCardResponse, Order, CreateOrderRequest
} from '@/types'

// ==================== Helpers ====================

class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public errors?: Record<string, string[]>
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

function convertTimestamps(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Timestamp) {
            result[key] = value.toDate()
        } else if (Array.isArray(value)) {
            result[key] = value.map(item =>
                item instanceof Timestamp ? item.toDate() :
                    (item && typeof item === 'object') ? convertTimestamps(item as Record<string, unknown>) : item
            )
        } else if (value && typeof value === 'object' && !(value instanceof Date)) {
            result[key] = convertTimestamps(value as Record<string, unknown>)
        } else {
            result[key] = value
        }
    }
    return result
}

function docToEntity<T>(data: DocumentData, id: string): T {
    return { id, ...convertTimestamps(data as Record<string, unknown>) } as T
}

function paginate<T>(items: T[], page: number = 1, pageLimit: number = 10): PaginatedResponse<T> {
    const total = items.length
    const totalPages = Math.ceil(total / pageLimit)
    const start = (page - 1) * pageLimit
    return {
        items: items.slice(start, start + pageLimit),
        total,
        page,
        limit: pageLimit,
        totalPages,
        pagination: { total, page, limit: pageLimit, pages: totalPages },
    }
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s\u0590-\u05FF-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

function generateGiftCardCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const randomValues = new Uint8Array(16)
    crypto.getRandomValues(randomValues)
    let idx = 0
    return Array.from({ length: 4 }, () =>
        Array.from({ length: 4 }, () =>
            chars[randomValues[idx++] % chars.length]
        ).join('')
    ).join('-')
}

function requireAuth() {
    const user = auth.currentUser
    if (!user) throw new ApiError(401, 'Authentication required')
    return user
}

async function getUserProfile(uid: string): Promise<User> {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (!userDoc.exists()) throw new ApiError(404, 'User not found')
    return docToEntity<User>(userDoc.data(), uid)
}

async function logAudit(
    action: string,
    entityType: string,
    entityId?: string,
    diffSummary?: string
) {
    const user = auth.currentUser
    if (!user) return
    try {
        await addDoc(collection(db, 'auditLogs'), {
            actorUserId: user.uid,
            actorEmail: user.email || '',
            action,
            entityType,
            entityId: entityId || null,
            diffSummary: diffSummary || null,
            createdAt: serverTimestamp(),
        })
    } catch {
        // Audit logging should not block operations
    }
}

async function resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number
): Promise<{ base64: string; width: number; height: number; sizeBytes: number; contentType: string }> {
    if (file.type === 'application/pdf') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1]
                resolve({ base64, width: 0, height: 0, sizeBytes: file.size, contentType: file.type })
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    return new Promise((resolve, reject) => {
        const img = new Image()
        const reader = new FileReader()
        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let { width, height } = img
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height)
                    width = Math.round(width * ratio)
                    height = Math.round(height * ratio)
                }
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                if (!ctx) { reject(new Error('Canvas context not available')); return }
                ctx.drawImage(img, 0, 0, width, height)
                const dataUrl = canvas.toDataURL('image/jpeg', quality)
                const base64 = dataUrl.split(',')[1]
                const sizeBytes = Math.round(base64.length * 0.75)
                resolve({ base64, width, height, sizeBytes, contentType: 'image/jpeg' })
            }
            img.onerror = reject
            img.src = e.target!.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

async function generateOrderNumber(): Promise<string> {
    const counterRef = doc(db, 'counters', 'orders')
    const newNumber = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef)
        const current = counterDoc.exists() ? (counterDoc.data().count as number) : 0
        transaction.set(counterRef, { count: current + 1 })
        return current + 1
    })
    return `ORD-${String(newNumber).padStart(6, '0')}`
}

function getDefaultSettings(): SiteSettings {
    return {
        chandelier: {
            enabled: false,
            altText: 'נברשת ברבי',
            placement: 'hero',
            desktopSize: 'medium',
            mobileSize: 'compact',
            ariaHidden: true,
        },
        announcements: [],
        marqueeItems: [],
        featuredSections: [],
        navLinks: [],
        footer: {
            address: 'נמל יפו 1, יפו',
            phone: '03-5188123',
            email: 'info@barby.co.il',
            socialLinks: [],
            copyrightText: '© ברבי תל אביב',
        },
        updatedAt: new Date(),
        updatedBy: '',
    }
}

// ==================== Auth API ====================

export const authApi = {
    register: async (data: { email: string; password: string; name: string }) => {
        const credential = await createUserWithEmailAndPassword(auth, data.email, data.password)
        const uid = credential.user.uid

        const userData = {
            name: data.name,
            email: data.email,
            role: 'viewer' as const,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }
        await setDoc(doc(db, 'users', uid), userData)
        return { user: { id: uid, ...userData } }
    },

    login: async (email: string, password: string) => {
        const credential = await signInWithEmailAndPassword(auth, email, password)
        const idToken = await credential.user.getIdToken()
        const userProfile = await getUserProfile(credential.user.uid)
        return { accessToken: idToken, refreshToken: '', user: userProfile }
    },

    logout: async () => {
        await signOut(auth)
    },

    me: async () => {
        const user = requireAuth()
        const userProfile = await getUserProfile(user.uid)
        return { user: userProfile }
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        const user = requireAuth()
        if (!user.email) throw new ApiError(400, 'No email associated with account')
        const credential = EmailAuthProvider.credential(user.email, currentPassword)
        await reauthenticateWithCredential(user, credential)
        await updatePassword(user, newPassword)
        return { success: true, message: 'Password changed successfully' }
    },
}

// ==================== Public API ====================

export const publicApi = {
    getShows: async (params?: { limit?: number; cursor?: string; featured?: boolean }) => {
        const pageLimit = params?.limit || 10
        const constraints: QueryConstraint[] = [
            where('published', '==', true),
            where('archived', '==', false),
            orderBy('dateISO', 'desc'),
        ]

        if (params?.cursor) {
            const cursorDoc = await getDoc(doc(db, 'shows', params.cursor))
            if (cursorDoc.exists()) {
                constraints.push(startAfter(cursorDoc))
            }
        }

        constraints.push(firestoreLimit(pageLimit + 1))

        const q = query(collection(db, 'shows'), ...constraints)
        const snapshot = await getDocs(q)

        const hasMore = snapshot.docs.length > pageLimit
        const docs = hasMore ? snapshot.docs.slice(0, pageLimit) : snapshot.docs
        let shows = docs.map(d => docToEntity<Show>(d.data(), d.id))

        if (params?.featured) {
            shows = shows.filter(s => s.featured)
        }

        return {
            items: shows,
            total: shows.length,
            page: 1,
            limit: pageLimit,
            totalPages: 1,
            lastDocId: hasMore && docs.length > 0 ? docs[docs.length - 1].id : undefined,
        }
    },

    getShow: async (slug: string) => {
        const q = query(
            collection(db, 'shows'),
            where('slug', '==', slug),
            firestoreLimit(1)
        )
        const snapshot = await getDocs(q)

        if (snapshot.empty) {
            // Try by document ID
            const docSnap = await getDoc(doc(db, 'shows', slug))
            if (!docSnap.exists()) throw new ApiError(404, 'Show not found')
            const show = docToEntity<Show>(docSnap.data(), docSnap.id)
            if (show.published === false) throw new ApiError(404, 'Show not found')
            return { show }
        }

        const show = docToEntity<Show>(snapshot.docs[0].data(), snapshot.docs[0].id)
        if (show.published === false) throw new ApiError(404, 'Show not found')
        return { show }
    },

    getArchive: async (params?: { limit?: number; cursor?: string; year?: number }) => {
        const pageLimit = params?.limit || 10
        const constraints: QueryConstraint[] = [
            where('archived', '==', true),
            orderBy('dateISO', 'desc'),
        ]

        if (params?.year) {
            constraints.push(
                where('dateISO', '>=', `${params.year}-01-01`),
                where('dateISO', '<', `${params.year + 1}-01-01`)
            )
        }

        if (params?.cursor) {
            const cursorDoc = await getDoc(doc(db, 'shows', params.cursor))
            if (cursorDoc.exists()) {
                constraints.push(startAfter(cursorDoc))
            }
        }

        constraints.push(firestoreLimit(pageLimit + 1))

        const q = query(collection(db, 'shows'), ...constraints)
        const snapshot = await getDocs(q)

        const hasMore = snapshot.docs.length > pageLimit
        const docs = hasMore ? snapshot.docs.slice(0, pageLimit) : snapshot.docs
        const shows = docs.map(d => docToEntity<Show>(d.data(), d.id))

        return {
            items: shows,
            total: shows.length,
            page: 1,
            limit: pageLimit,
            totalPages: 1,
            lastDocId: hasMore && docs.length > 0 ? docs[docs.length - 1].id : undefined,
        }
    },

    getPage: async (slug: string) => {
        try {
            const docSnap = await getDoc(doc(db, 'pages', slug))
            if (!docSnap.exists()) return { page: null }
            return { page: { key: slug, ...convertTimestamps(docSnap.data() as Record<string, unknown>) } as Page }
        } catch {
            return { page: null }
        }
    },

    getSettings: async () => {
        const docSnap = await getDoc(doc(db, 'siteSettings', 'main'))
        if (!docSnap.exists()) return { settings: getDefaultSettings() }
        return { settings: convertTimestamps(docSnap.data() as Record<string, unknown>) as unknown as SiteSettings }
    },

    getFAQs: async () => {
        const q = query(collection(db, 'faq'), where('isActive', '==', true), orderBy('order', 'asc'))
        const snapshot = await getDocs(q)
        const faqs = snapshot.docs.map(d => docToEntity<FAQItem>(d.data(), d.id))
        return { faqs }
    },
}

// ==================== Admin API ====================

export const adminApi = {
    // Shows
    getShows: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
        const constraints: QueryConstraint[] = [orderBy('dateISO', 'desc')]

        if (params?.status) {
            constraints.unshift(where('status', '==', params.status))
        }

        constraints.push(firestoreLimit(500))

        const q = query(collection(db, 'shows'), ...constraints)
        const snapshot = await getDocs(q)
        let shows = snapshot.docs.map(d => docToEntity<Show>(d.data(), d.id))

        // Text search must be client-side (Firestore limitation)
        if (params?.search) {
            const search = params.search.toLowerCase()
            shows = shows.filter(s =>
                s.title.toLowerCase().includes(search) ||
                s.description?.toLowerCase().includes(search)
            )
        }

        return paginate(shows, params?.page, params?.limit)
    },

    getShow: async (id: string) => {
        const docSnap = await getDoc(doc(db, 'shows', id))
        if (!docSnap.exists()) throw new ApiError(404, 'Show not found')
        return { show: docToEntity<Show>(docSnap.data(), id) }
    },

    createShow: async (data: Partial<Show>) => {
        const user = requireAuth()
        let slug = data.slug || generateSlug(data.title || '')

        // Ensure slug is unique
        const existingSlug = await getDocs(query(collection(db, 'shows'), where('slug', '==', slug), firestoreLimit(1)))
        if (!existingSlug.empty) {
            slug = `${slug}-${Date.now()}`
        }

        const showData = {
            ...data,
            slug,
            published: data.published ?? false,
            archived: data.archived ?? false,
            featured: data.featured ?? false,
            tags: data.tags || [],
            ticketTiers: data.ticketTiers || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: user.uid,
            updatedBy: user.uid,
        }
        delete (showData as Record<string, unknown>).id
        const docRef = await addDoc(collection(db, 'shows'), showData)
        await logAudit('create', 'show', docRef.id, `Created show: ${data.title}`)
        const created = await getDoc(docRef)
        return { show: docToEntity<Show>(created.data()!, docRef.id) }
    },

    updateShow: async (id: string, data: Partial<Show>) => {
        const user = requireAuth()
        const updateData = { ...data, updatedAt: serverTimestamp(), updatedBy: user.uid }
        delete (updateData as Record<string, unknown>).id
        await updateDoc(doc(db, 'shows', id), updateData)
        await logAudit('update', 'show', id, `Updated show: ${data.title || id}`)
        const updated = await getDoc(doc(db, 'shows', id))
        return { show: docToEntity<Show>(updated.data()!, id) }
    },

    deleteShow: async (id: string) => {
        await deleteDoc(doc(db, 'shows', id))
        await logAudit('delete', 'show', id)
    },

    // Pages
    getPages: async (params?: { page?: number; limit?: number }) => {
        const snapshot = await getDocs(collection(db, 'pages'))
        const pages = snapshot.docs.map(d =>
            ({ key: d.id, ...convertTimestamps(d.data() as Record<string, unknown>) } as Page)
        )
        return paginate(pages, params?.page, params?.limit)
    },

    getPage: async (id: string) => {
        const docSnap = await getDoc(doc(db, 'pages', id))
        if (!docSnap.exists()) {
            // Return empty page template so admin can edit it
            return { page: { key: id as Page['key'], title: '', contentRichText: '', pdfMediaId: undefined, updatedAt: new Date(), updatedBy: '' } as Page }
        }
        return { page: { key: id, ...convertTimestamps(docSnap.data() as Record<string, unknown>) } as Page }
    },

    createPage: async (data: Partial<Page>) => {
        const user = requireAuth()
        const key = data.key || generateSlug(data.title || '')
        const pageData = {
            title: data.title || '',
            contentRichText: data.contentRichText || '',
            pdfMediaId: data.pdfMediaId || null,
            updatedAt: serverTimestamp(),
            updatedBy: user.uid,
        }
        await setDoc(doc(db, 'pages', key), pageData)
        await logAudit('create', 'page', key, `Created page: ${data.title}`)
        return { page: { key, ...pageData } as unknown as Page }
    },

    updatePage: async (id: string, data: Partial<Page>) => {
        const user = requireAuth()
        const updateData: Record<string, unknown> = {
            ...data,
            updatedAt: serverTimestamp(),
            updatedBy: user.uid,
        }
        delete updateData.key
        // Use setDoc with merge so it creates the doc if it doesn't exist
        await setDoc(doc(db, 'pages', id), updateData, { merge: true })
        await logAudit('update', 'page', id, `Updated page: ${data.title || id}`)
        const updated = await getDoc(doc(db, 'pages', id))
        return { page: { key: id, ...convertTimestamps(updated.data()! as Record<string, unknown>) } as Page }
    },

    deletePage: async (id: string) => {
        await deleteDoc(doc(db, 'pages', id))
        await logAudit('delete', 'page', id)
    },

    // Settings
    getSettings: async () => {
        const docSnap = await getDoc(doc(db, 'siteSettings', 'main'))
        if (!docSnap.exists()) return { settings: getDefaultSettings() }
        return { settings: convertTimestamps(docSnap.data() as Record<string, unknown>) as unknown as SiteSettings }
    },

    updateSettings: async (data: Partial<SiteSettings>) => {
        const user = requireAuth()
        const updateData = JSON.parse(JSON.stringify({ ...data, updatedAt: null, updatedBy: user.uid }))
        updateData.updatedAt = serverTimestamp()
        await setDoc(doc(db, 'siteSettings', 'main'), updateData, { merge: true })
        await logAudit('update', 'site-settings', 'main')
        const updated = await getDoc(doc(db, 'siteSettings', 'main'))
        return { settings: convertTimestamps(updated.data()! as Record<string, unknown>) as unknown as SiteSettings }
    },

    // Users
    getUsers: async (params?: { page?: number; limit?: number }) => {
        const snapshot = await getDocs(query(collection(db, 'users'), firestoreLimit(200)))
        const users = snapshot.docs.map(d => docToEntity<User>(d.data(), d.id))
        return paginate(users, params?.page, params?.limit)
    },

    getUser: async (id: string) => {
        return { user: await getUserProfile(id) }
    },

    createUser: async (data: Partial<User> & { password: string }) => {
        requireAuth()
        // Use a secondary Firebase app to create user without affecting current admin session
        const tempApp = initializeApp(auth.app.options, `temp-${Date.now()}`)
        try {
            const tempAuth = getFirebaseAuth(tempApp)
            const credential = await createUserWithEmailAndPassword(tempAuth, data.email!, data.password)
            const uid = credential.user.uid

            const userData = {
                name: data.name || '',
                email: data.email || '',
                role: data.role || 'editor',
                isActive: data.isActive ?? true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }
            await setDoc(doc(db, 'users', uid), userData)
            await logAudit('create', 'user', uid, `Created user: ${data.email}`)
            return { user: { id: uid, ...userData } as unknown as User }
        } finally {
            await deleteApp(tempApp)
        }
    },

    updateUser: async (id: string, data: Partial<User> & { password?: string }) => {
        const updateData: Record<string, unknown> = { updatedAt: serverTimestamp() }
        if (data.name !== undefined) updateData.name = data.name
        if (data.email !== undefined) updateData.email = data.email
        if (data.role !== undefined) updateData.role = data.role
        if (data.isActive !== undefined) updateData.isActive = data.isActive

        await updateDoc(doc(db, 'users', id), updateData)
        await logAudit('update', 'user', id, `Updated user: ${data.email || id}`)
        const updated = await getDoc(doc(db, 'users', id))
        return { user: docToEntity<User>(updated.data()!, id) }
    },

    deleteUser: async (id: string) => {
        await deleteDoc(doc(db, 'users', id))
        await logAudit('delete', 'user', id)
    },

    // Media
    getMediaById: async (id: string) => {
        const docSnap = await getDoc(doc(db, 'media', id))
        if (!docSnap.exists()) return null
        return docToEntity<Media>(docSnap.data(), id)
    },

    getMedia: async (params?: { page?: number; limit?: number; type?: string }) => {
        const snapshot = await getDocs(query(collection(db, 'media'), orderBy('createdAt', 'desc'), firestoreLimit(500)))
        let media = snapshot.docs.map(d => docToEntity<Media>(d.data(), d.id))

        if (params?.type) {
            media = media.filter(m => m.contentType.startsWith(params.type!))
        }

        return paginate(media, params?.page, params?.limit)
    },

    uploadMedia: async (file: File, altText?: string) => {
        const user = requireAuth()
        const main = await resizeImage(file, 1920, 1080, 0.8)
        const thumb = file.type.startsWith('image/')
            ? await resizeImage(file, 400, 300, 0.7)
            : null

        const mediaData = {
            originalName: file.name,
            contentType: main.contentType,
            width: main.width,
            height: main.height,
            sizeBytes: main.sizeBytes,
            dataBase64: main.base64,
            altText: altText || '',
            variants: thumb ? [{
                name: 'thumbnail',
                contentType: thumb.contentType,
                width: thumb.width,
                height: thumb.height,
                sizeBytes: thumb.sizeBytes,
                dataBase64: thumb.base64,
            }] : [],
            createdAt: serverTimestamp(),
            createdBy: user.uid,
        }

        const docRef = await addDoc(collection(db, 'media'), mediaData)
        await logAudit('create', 'media', docRef.id, `Uploaded: ${file.name}`)
        return { media: { id: docRef.id, ...mediaData } as unknown as Media }
    },

    deleteMedia: async (id: string) => {
        await deleteDoc(doc(db, 'media', id))
        await logAudit('delete', 'media', id)
    },

    // Audit Logs
    getAuditLogs: async (params?: { page?: number; limit?: number; userId?: string; action?: string }) => {
        const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]

        if (params?.userId) {
            constraints.unshift(where('actorUserId', '==', params.userId))
        }
        if (params?.action) {
            constraints.unshift(where('action', '==', params.action))
        }

        constraints.push(firestoreLimit(500))

        const q = query(collection(db, 'auditLogs'), ...constraints)
        const snapshot = await getDocs(q)
        const logs = snapshot.docs.map(d => docToEntity<AuditLog>(d.data(), d.id))

        return paginate(logs, params?.page, params?.limit)
    },

    // FAQ
    getFAQs: async () => {
        const snapshot = await getDocs(query(collection(db, 'faq'), orderBy('order', 'asc')))
        return snapshot.docs.map(d => docToEntity<FAQItem>(d.data(), d.id))
    },

    getFAQ: async (id: string) => {
        const docSnap = await getDoc(doc(db, 'faq', id))
        if (!docSnap.exists()) throw new ApiError(404, 'FAQ not found')
        return { faq: docToEntity<FAQItem>(docSnap.data(), id) }
    },

    createFAQ: async (data: { question: string; answer: string; category?: string; isActive?: boolean }) => {
        const faqData = {
            ...data,
            isActive: data.isActive ?? true,
            order: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }
        const docRef = await addDoc(collection(db, 'faq'), faqData)
        return { faq: { id: docRef.id, ...faqData } as unknown as FAQItem }
    },

    updateFAQ: async (id: string, data: Partial<{ question: string; answer: string; category: string; isActive: boolean; order: number }>) => {
        await updateDoc(doc(db, 'faq', id), { ...data, updatedAt: serverTimestamp() })
        const updated = await getDoc(doc(db, 'faq', id))
        return { faq: docToEntity<FAQItem>(updated.data()!, id) }
    },

    deleteFAQ: async (id: string) => {
        await deleteDoc(doc(db, 'faq', id))
    },

    reorderFAQs: async (ids: string[]) => {
        const batch = writeBatch(db)
        ids.forEach((id, index) => {
            batch.update(doc(db, 'faq', id), { order: index })
        })
        await batch.commit()
    },
}

// ==================== Gift Card API ====================

export const giftCardApi = {
    create: async (data: CreateGiftCardRequest) => {
        const user = requireAuth()
        const userProfile = await getUserProfile(user.uid)
        const code = generateGiftCardCode()
        const now = new Date()
        const expiresAt = new Date(now)
        expiresAt.setFullYear(expiresAt.getFullYear() + 5)

        const giftCardData = {
            code,
            amount: data.amount,
            balance: data.amount,
            currency: 'ILS',
            status: 'active',
            purchaserId: user.uid,
            purchaserEmail: user.email || '',
            purchaserName: userProfile.name || '',
            recipientEmail: data.recipientEmail,
            recipientName: data.recipientName,
            recipientPhone: data.recipientPhone || null,
            isForSelf: data.isForSelf,
            message: data.message || null,
            purchasedAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(expiresAt),
            usageHistory: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(collection(db, 'giftCards'), giftCardData)
        return { id: docRef.id, ...giftCardData } as unknown as GiftCard
    },

    getMyGiftCards: async () => {
        const user = requireAuth()
        const q = query(collection(db, 'giftCards'), where('recipientEmail', '==', user.email))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(d => docToEntity<GiftCard>(d.data(), d.id))
    },

    getPurchasedGiftCards: async () => {
        const user = requireAuth()
        const q = query(collection(db, 'giftCards'), where('purchaserId', '==', user.uid))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(d => docToEntity<GiftCard>(d.data(), d.id))
    },

    getByCode: async (code: string) => {
        const q = query(collection(db, 'giftCards'), where('code', '==', code), firestoreLimit(1))
        const snapshot = await getDocs(q)
        if (snapshot.empty) throw new ApiError(404, 'Gift card not found')
        return docToEntity<GiftCard>(snapshot.docs[0].data(), snapshot.docs[0].id)
    },

    validate: async (code: string) => {
        const q = query(collection(db, 'giftCards'), where('code', '==', code), firestoreLimit(1))
        const snapshot = await getDocs(q)
        if (snapshot.empty) throw new ApiError(404, 'Gift card not found')

        const data = snapshot.docs[0].data()
        const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : new Date(data.expiresAt)

        if (expiresAt < new Date()) {
            await updateDoc(snapshot.docs[0].ref, { status: 'expired' })
            return { code, balance: 0, status: 'expired' as const, expiresAt } as ValidateGiftCardResponse
        }

        return {
            code: data.code,
            balance: data.balance,
            status: data.status,
            expiresAt,
        } as ValidateGiftCardResponse
    },

    use: async (code: string, amount: number, orderId?: string, description?: string) => {
        if (amount <= 0) throw new ApiError(400, 'Amount must be positive')

        const q = query(collection(db, 'giftCards'), where('code', '==', code), firestoreLimit(1))
        const snapshot = await getDocs(q)
        if (snapshot.empty) throw new ApiError(404, 'Gift card not found')

        const docRef = snapshot.docs[0].ref

        const updatedGiftCard = await runTransaction(db, async (transaction) => {
            const freshDoc = await transaction.get(docRef)
            if (!freshDoc.exists()) throw new ApiError(404, 'Gift card not found')
            const data = freshDoc.data()

            if (amount > data.balance) throw new ApiError(400, 'Insufficient gift card balance')

            const newBalance = data.balance - amount
            const usageRecord = {
                date: Timestamp.now(),
                amount,
                orderId: orderId || null,
                description: description || `Used ${amount} ILS`,
            }

            transaction.update(docRef, {
                balance: newBalance,
                status: newBalance <= 0 ? 'redeemed' : 'partially_used',
                usageHistory: [...(data.usageHistory || []), usageRecord],
                updatedAt: serverTimestamp(),
            })

            return { id: freshDoc.id, ...data, balance: newBalance }
        })

        return updatedGiftCard as unknown as GiftCard
    },
}

// ==================== Order API ====================

export const orderApi = {
    create: async (data: CreateOrderRequest) => {
        const user = requireAuth()
        const userProfile = await getUserProfile(user.uid)
        const orderNumber = await generateOrderNumber()

        const showDoc = await getDoc(doc(db, 'shows', data.showId))
        if (!showDoc.exists()) throw new ApiError(404, 'Show not found')
        const show = showDoc.data()

        if (show.status === 'sold_out') throw new ApiError(400, 'Show is sold out')
        if (show.status === 'cancelled') throw new ApiError(400, 'Show is cancelled')

        // Validate ticket prices from server-side show data (never trust client prices)
        const tickets = data.tickets.map(t => {
            const serverTier = show.ticketTiers?.find((st: { label: string; price: number }) => st.label === t.tierLabel)
            if (!serverTier) throw new ApiError(400, `Ticket tier "${t.tierLabel}" not found`)
            const serverPrice = serverTier.price
            return {
                tierLabel: t.tierLabel,
                tierPrice: serverPrice,
                quantity: t.quantity,
                subtotal: serverPrice * t.quantity,
            }
        })
        const totalAmount = tickets.reduce((sum, t) => sum + t.subtotal, 0)

        const orderData = {
            orderNumber,
            userId: user.uid,
            userEmail: user.email || '',
            userName: userProfile.name || '',
            userPhone: data.userPhone || '',
            userIdNumber: data.userIdNumber || '',
            showId: data.showId,
            showTitle: show.title,
            showDate: show.dateISO,
            showVenue: show.venueName,
            tickets,
            totalAmount,
            currency: 'ILS',
            status: 'pending',
            paymentStatus: 'pending',
            giftCardCode: data.giftCardCode || null,
            giftCardAmountUsed: data.giftCardAmountUsed || 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(collection(db, 'orders'), orderData)
        return { id: docRef.id, ...orderData } as unknown as Order
    },

    getMyOrders: async () => {
        const user = requireAuth()
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(d => docToEntity<Order>(d.data(), d.id))
    },

    getById: async (id: string) => {
        const docSnap = await getDoc(doc(db, 'orders', id))
        if (!docSnap.exists()) throw new ApiError(404, 'Order not found')
        return docToEntity<Order>(docSnap.data(), id)
    },

    getByNumber: async (orderNumber: string) => {
        const q = query(
            collection(db, 'orders'),
            where('orderNumber', '==', orderNumber),
            firestoreLimit(1)
        )
        const snapshot = await getDocs(q)
        if (snapshot.empty) throw new ApiError(404, 'Order not found')
        return docToEntity<Order>(snapshot.docs[0].data(), snapshot.docs[0].id)
    },

    cancel: async (id: string) => {
        const user = requireAuth()
        const docSnap = await getDoc(doc(db, 'orders', id))
        if (!docSnap.exists()) throw new ApiError(404, 'Order not found')
        const orderData = docSnap.data()

        // Only the order owner or an editor/admin can cancel
        if (orderData.userId !== user.uid) {
            const userProfile = await getUserProfile(user.uid)
            if (userProfile.role !== 'admin' && userProfile.role !== 'editor') {
                throw new ApiError(403, 'Not authorized to cancel this order')
            }
        }

        if (orderData.status === 'cancelled') {
            throw new ApiError(400, 'Order already cancelled')
        }

        // If gift card was used, refund the balance in a transaction
        if (orderData.giftCardCode && orderData.giftCardAmountUsed > 0) {
            const gcQuery = query(collection(db, 'giftCards'), where('code', '==', orderData.giftCardCode), firestoreLimit(1))
            const gcSnap = await getDocs(gcQuery)
            if (!gcSnap.empty) {
                const gcRef = gcSnap.docs[0].ref
                await runTransaction(db, async (transaction) => {
                    const gcDoc = await transaction.get(gcRef)
                    if (gcDoc.exists()) {
                        const gcData = gcDoc.data()
                        transaction.update(gcRef, {
                            balance: gcData.balance + orderData.giftCardAmountUsed,
                            status: 'active',
                            updatedAt: serverTimestamp(),
                        })
                    }
                    transaction.update(doc(db, 'orders', id), {
                        status: 'cancelled',
                        updatedAt: serverTimestamp(),
                    })
                })
                const updated = await getDoc(doc(db, 'orders', id))
                return docToEntity<Order>(updated.data()!, id)
            }
        }

        await updateDoc(doc(db, 'orders', id), {
            status: 'cancelled',
            updatedAt: serverTimestamp(),
        })
        const updated = await getDoc(doc(db, 'orders', id))
        return docToEntity<Order>(updated.data()!, id)
    },
}

export { ApiError }
