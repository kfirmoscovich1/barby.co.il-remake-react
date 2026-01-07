/**
 * @file api.ts
 * @description API service layer for communicating with the backend.
 * 
 * This module provides:
 * - Base fetch wrapper with authentication
 * - Automatic token refresh on 401 errors
 * - Type-safe API methods for all endpoints
 * 
 * API Categories:
 * - authApi: Login, register, logout, token refresh
 * - publicApi: Shows, pages, settings (no auth required)
 * - adminApi: CRUD operations (requires editor/admin role)
 * - mediaApi: File upload and management
 */

import type { Show, Page, SiteSettings, User, Media, AuditLog, PaginatedResponse, FAQItem, GiftCard, CreateGiftCardRequest, ValidateGiftCardResponse, Order, CreateOrderRequest } from '@/types'

// Use environment variable in production, fallback to /api for dev proxy
export const API_BASE = import.meta.env.VITE_API_URL || '/api'

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>
}

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

async function request<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { params, ...init } = options

    let url = `${API_BASE}${endpoint}`
    if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value))
            }
        })
        const queryString = searchParams.toString()
        if (queryString) {
            url += `?${queryString}`
        }
    }

    const token = localStorage.getItem('accessToken')
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...init.headers,
    }

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
        ...init,
        headers,
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // Handle token refresh
        if (response.status === 401 && token) {
            const refreshed = await refreshToken()
            if (refreshed) {
                // Retry request with new token
                const newToken = localStorage.getItem('accessToken')
                if (newToken) {
                    (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`
                }
                const retryResponse = await fetch(url, { ...init, headers })
                if (retryResponse.ok) {
                    return retryResponse.json()
                }
            }
            // Refresh failed, clear tokens
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
        }

        throw new ApiError(
            response.status,
            errorData.message || 'An error occurred',
            errorData.errors
        )
    }

    // Handle empty responses
    const text = await response.text()
    if (!text) return {} as T
    return JSON.parse(text)
}

async function refreshToken(): Promise<boolean> {
    const refreshTokenValue = localStorage.getItem('refreshToken')
    if (!refreshTokenValue) return false

    try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: refreshTokenValue }),
        })

        if (!response.ok) return false

        const data = await response.json()
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        return true
    } catch {
        return false
    }
}

// ==================== Auth API ====================

export const authApi = {
    login: (email: string, password: string) =>
        request<{ success: boolean; data: { accessToken: string; refreshToken: string; user: User } }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }).then(res => res.data),

    logout: () =>
        request<void>('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }),
        }),

    me: () => request<{ success: boolean; data: { user: User } }>('/auth/me')
        .then(res => res.data),

    changePassword: (currentPassword: string, newPassword: string) =>
        request<{ success: boolean; message: string }>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword }),
        }),
}

// ==================== Public API ====================

export const publicApi = {
    // Shows
    getShows: (params?: { page?: number; limit?: number; featured?: boolean }) =>
        request<{ success: boolean; data: PaginatedResponse<Show> }>('/public/shows', { params })
            .then(res => res.data),

    getShow: (slug: string) =>
        request<{ success: boolean; data: Show }>(`/public/shows/${slug}`)
            .then(res => ({ show: res.data })),

    getArchive: (params?: { page?: number; limit?: number; year?: number }) =>
        request<{ success: boolean; data: PaginatedResponse<Show> }>('/public/archive', { params })
            .then(res => res.data),

    // Pages
    getPage: (slug: string) =>
        request<{ success: boolean; data: Page }>(`/public/pages/${slug}`)
            .then(res => ({ page: res.data }))
            .catch(() => ({ page: null })),

    // Settings
    getSettings: () =>
        request<{ success: boolean; data: SiteSettings }>('/public/site-settings')
            .then(res => ({ settings: res.data })),

    // FAQ
    getFAQs: () =>
        request<{ success: boolean; data: FAQItem[] }>('/public/faq')
            .then(res => ({ faqs: res.data })),
}

// ==================== Admin API ====================

export const adminApi = {
    // Shows
    getShows: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
        request<{ success: boolean; data: PaginatedResponse<Show> }>('/admin/shows', { params })
            .then(res => res.data),

    getShow: (id: string) =>
        request<{ success: boolean; data: Show }>(`/admin/shows/${id}`)
            .then(res => ({ show: res.data })),

    createShow: (data: Partial<Show>) =>
        request<{ success: boolean; data: Show }>('/admin/shows', {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(res => ({ show: res.data })),

    updateShow: (id: string, data: Partial<Show>) =>
        request<{ success: boolean; data: Show }>(`/admin/shows/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }).then(res => ({ show: res.data })),

    deleteShow: (id: string) =>
        request<void>(`/admin/shows/${id}`, { method: 'DELETE' }),

    // Pages
    getPages: (params?: { page?: number; limit?: number }) =>
        request<{ success: boolean; data: PaginatedResponse<Page> }>('/admin/pages', { params })
            .then(res => res.data),

    getPage: (id: string) =>
        request<{ success: boolean; data: Page }>(`/admin/pages/${id}`)
            .then(res => ({ page: res.data })),

    createPage: (data: Partial<Page>) =>
        request<{ success: boolean; data: Page }>('/admin/pages', {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(res => ({ page: res.data })),

    updatePage: (id: string, data: Partial<Page>) =>
        request<{ success: boolean; data: Page }>(`/admin/pages/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }).then(res => ({ page: res.data })),

    deletePage: (id: string) =>
        request<void>(`/admin/pages/${id}`, { method: 'DELETE' }),

    // Settings
    getSettings: () =>
        request<{ success: boolean; data: SiteSettings }>('/admin/site-settings')
            .then(res => ({ settings: res.data })),

    updateSettings: (data: Partial<SiteSettings>) =>
        request<{ success: boolean; data: SiteSettings }>('/admin/site-settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        }).then(res => ({ settings: res.data })),

    // Users
    getUsers: (params?: { page?: number; limit?: number }) =>
        request<{ success: boolean; data: PaginatedResponse<User> }>('/admin/users', { params })
            .then(res => res.data),

    getUser: (id: string) =>
        request<{ success: boolean; data: User }>(`/admin/users/${id}`)
            .then(res => ({ user: res.data })),

    createUser: (data: Partial<User> & { password: string }) =>
        request<{ success: boolean; data: User }>('/admin/users', {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(res => ({ user: res.data })),

    updateUser: (id: string, data: Partial<User> & { password?: string }) =>
        request<{ success: boolean; data: User }>(`/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }).then(res => ({ user: res.data })),

    deleteUser: (id: string) =>
        request<void>(`/admin/users/${id}`, { method: 'DELETE' }),

    // Media
    getMedia: (params?: { page?: number; limit?: number; type?: string }) =>
        request<{ success: boolean; data: PaginatedResponse<Media> }>('/admin/media', { params })
            .then(res => res.data),

    uploadMedia: async (file: File, altText?: string) => {
        const formData = new FormData()
        formData.append('file', file)
        if (altText) formData.append('altText', altText)

        const token = localStorage.getItem('accessToken')
        const response = await fetch(`${API_BASE}/admin/media`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        })

        if (!response.ok) {
            const error = await response.json()
            throw new ApiError(response.status, error.message)
        }

        const result = await response.json() as { success: boolean; data: Media }
        return { media: result.data }
    },

    deleteMedia: (id: string) =>
        request<void>(`/admin/media/${id}`, { method: 'DELETE' }),

    // Audit logs
    getAuditLogs: (params?: { page?: number; limit?: number; userId?: string; action?: string }) =>
        request<{ success: boolean; data: PaginatedResponse<AuditLog> }>('/admin/audit-logs', { params })
            .then(res => res.data),

    // FAQ
    getFAQs: () =>
        request<{ success: boolean; data: FAQItem[] }>('/admin/faq')
            .then(res => res.data),

    getFAQ: (id: string) =>
        request<{ success: boolean; data: FAQItem }>(`/admin/faq/${id}`)
            .then(res => ({ faq: res.data })),

    createFAQ: (data: { question: string; answer: string; category?: string; isActive?: boolean }) =>
        request<{ success: boolean; data: FAQItem }>('/admin/faq', {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(res => ({ faq: res.data })),

    updateFAQ: (id: string, data: Partial<{ question: string; answer: string; category: string; isActive: boolean; order: number }>) =>
        request<{ success: boolean; data: FAQItem }>(`/admin/faq/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }).then(res => ({ faq: res.data })),

    deleteFAQ: (id: string) =>
        request<void>(`/admin/faq/${id}`, { method: 'DELETE' }),

    reorderFAQs: (ids: string[]) =>
        request<void>('/admin/faq/reorder', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        }),
}

// ==================== Gift Card API ====================

export const giftCardApi = {
    // Create a new gift card (requires authentication)
    create: (data: CreateGiftCardRequest) =>
        request<{ success: boolean; data: GiftCard }>('/giftcards', {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(res => res.data),

    // Get gift cards received by current user
    getMyGiftCards: () =>
        request<{ success: boolean; data: GiftCard[] }>('/giftcards/my')
            .then(res => res.data),

    // Get gift cards purchased by current user
    getPurchasedGiftCards: () =>
        request<{ success: boolean; data: GiftCard[] }>('/giftcards/purchased')
            .then(res => res.data),

    // Get gift card by code
    getByCode: (code: string) =>
        request<{ success: boolean; data: GiftCard }>(`/giftcards/${code}`)
            .then(res => res.data),

    // Validate gift card code
    validate: (code: string) =>
        request<{ success: boolean; data: ValidateGiftCardResponse }>('/giftcards/validate', {
            method: 'POST',
            body: JSON.stringify({ code }),
        }).then(res => res.data),

    // Use gift card balance
    use: (code: string, amount: number, orderId?: string, description?: string) =>
        request<{ success: boolean; data: GiftCard }>('/giftcards/use', {
            method: 'POST',
            body: JSON.stringify({ code, amount, orderId, description }),
        }).then(res => res.data),
}

// ==================== Order API ====================

export const orderApi = {
    // Create a new order
    create: (data: CreateOrderRequest) =>
        request<Order>('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Get current user's orders
    getMyOrders: () =>
        request<Order[]>('/orders/my'),

    // Get order by ID
    getById: (id: string) =>
        request<Order>(`/orders/${id}`),

    // Get order by order number
    getByNumber: (orderNumber: string) =>
        request<Order>(`/orders/by-number/${orderNumber}`),

    // Cancel an order
    cancel: (id: string) =>
        request<Order>(`/orders/${id}/cancel`, {
            method: 'POST',
        }),
}

export { ApiError }
