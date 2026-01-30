/**
 * @file types/index.ts
 * @description Centralized TypeScript type definitions for the frontend application.
 * 
 * This module contains all shared types used across the React application including:
 * - Entity types (User, Show, Page, etc.)
 * - API response types
 * - Form input types
 * 
 * These types ensure type safety across all components, hooks, and services.
 */

// ==========================================
// User Types
// ==========================================
export type UserRole = 'admin' | 'editor';

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserPublic {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
}

// ==========================================
// Show Types
// ==========================================
export type ShowStatus = 'available' | 'sold_out' | 'closed' | 'few_left';

export interface TicketTier {
    label: string;
    price: number;
    currency: string;
    quantity?: number;
}

export interface Show {
    id: string;
    title: string;
    slug?: string;
    dateISO: string;
    doorsTime?: string;
    description: string;
    imageMediaId?: string;
    status: ShowStatus;
    isStanding?: boolean;
    is360?: boolean;
    isInternational?: boolean;
    venueName: string;
    venueAddress: string;
    ticketTiers: TicketTier[];
    tags: string[];
    featured: boolean;
    published: boolean;
    archived: boolean;
    publishDelay?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

export interface ShowListItem {
    id: string;
    title: string;
    slug?: string;
    dateISO: string;
    doorsTime?: string;
    description?: string;
    imageMediaId?: string;
    status: ShowStatus;
    isStanding?: boolean;
    is360?: boolean;
    venueName: string;
    ticketTiers: TicketTier[];
    featured: boolean;
    archived: boolean;
}

// ==========================================
// Page Types
// ==========================================
export type PageKey = 'about' | 'terms' | 'accessibility' | 'privacy' | 'contact' | 'mailing-list';

export interface Page {
    key: PageKey;
    title: string;
    contentRichText: string;
    pdfMediaId?: string;
    pdfUrl?: string;
    updatedAt: Date;
    updatedBy: string;
}

// ==========================================
// FAQ Types
// ==========================================
export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category?: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface FAQCategory {
    id: string;
    name: string;
    order: number;
}

// ==========================================
// Site Settings Types
// ==========================================
export interface ChandelierConfig {
    enabled: boolean;
    imageMediaId?: string;
    altText: string;
    placement: 'hero' | 'banner' | 'floating';
    desktopSize: 'small' | 'medium' | 'large';
    mobileSize: 'compact' | 'hidden';
    ariaHidden: boolean;
}

export interface NavLink {
    label: string;
    href: string;
    external: boolean;
    order: number;
}

export interface FooterContent {
    address: string;
    phone: string;
    email: string;
    socialLinks: { platform: string; url: string }[];
    copyrightText: string;
    googleMapsUrl?: string;
    wazeUrl?: string;
}

export interface Announcement {
    id: string;
    text: string;
    enabled: boolean;
    order: number;
}

export interface FeaturedSection {
    id: string;
    title: string;
    type: 'shows' | 'custom';
    showIds?: string[];
    enabled: boolean;
    order: number;
}

export interface SiteSettings {
    chandelier: ChandelierConfig;
    announcements: Announcement[];
    marqueeItems: string[];
    featuredSections: FeaturedSection[];
    navLinks: NavLink[];
    footer: FooterContent;
    updatedAt: Date;
    updatedBy: string;
}

// ==========================================
// Media Types
// ==========================================
export interface MediaVariant {
    name: string;
    contentType: string;
    width: number;
    height: number;
    sizeBytes: number;
    dataBase64: string;
}

export interface Media {
    id: string;
    originalName: string;
    contentType: string;
    width: number;
    height: number;
    sizeBytes: number;
    dataBase64: string;
    variants: MediaVariant[];
    createdAt: Date;
    createdBy: string;
}

export interface MediaListItem {
    id: string;
    originalName: string;
    contentType: string;
    width: number;
    height: number;
    sizeBytes: number;
    createdAt: Date;
}

// ==========================================
// Audit Log Types
// ==========================================
export type AuditAction =
    | 'create'
    | 'update'
    | 'delete'
    | 'login'
    | 'logout';

export type AuditEntityType =
    | 'user'
    | 'show'
    | 'page'
    | 'media'
    | 'site-settings';

export interface AuditLog {
    id: string;
    actorUserId: string;
    actorEmail: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string;
    diffSummary?: string;
    createdAt: Date;
}

// ==========================================
// API Types
// ==========================================
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: UserPublic;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
}

// ==========================================
// Query Params Types
// ==========================================
export interface ShowsQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: ShowStatus;
    featured?: boolean;
    archived?: boolean;
    startDate?: string;
    endDate?: string;
    tags?: string[];
}

// ==========================================
// Gift Card Types
// ==========================================
export type GiftCardStatus = 'active' | 'redeemed' | 'expired' | 'partially_used';

export interface GiftCardUsageRecord {
    date: Date;
    amount: number;
    orderId?: string;
    description: string;
}

export interface GiftCard {
    id: string;
    code: string;
    amount: number;
    balance: number;
    currency: string;
    status: GiftCardStatus;
    purchaserId: string;
    purchaserEmail: string;
    purchaserName: string;
    recipientEmail: string;
    recipientName: string;
    recipientPhone?: string;
    isForSelf: boolean;
    message?: string;
    purchasedAt: Date;
    expiresAt: Date;
    redeemedAt?: Date;
    usageHistory: GiftCardUsageRecord[];
    createdAt: Date;
    updatedAt: Date;
}

export interface GiftCardPublic {
    id: string;
    code: string;
    amount: number;
    balance: number;
    status: GiftCardStatus;
    recipientName: string;
    purchaserName: string;
    message?: string;
    purchasedAt: Date;
    expiresAt: Date;
    isForSelf: boolean;
}

export interface CreateGiftCardRequest {
    amount: number;
    recipientEmail: string;
    recipientName: string;
    recipientPhone?: string;
    isForSelf: boolean;
    message?: string;
}

export interface ValidateGiftCardResponse {
    code: string;
    balance: number;
    status: GiftCardStatus;
    expiresAt: Date;
}

// ==========================================
// Order Types
// ==========================================
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface OrderTicket {
    tierLabel: string;
    tierPrice: number;
    quantity: number;
    subtotal: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    userEmail: string;
    userName: string;
    userPhone: string;
    userIdNumber: string;
    showId: string;
    showTitle: string;
    showDate: Date;
    showVenue: string;
    tickets: OrderTicket[];
    totalAmount: number;
    currency: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    giftCardCode?: string;
    giftCardAmountUsed?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderPublic {
    id: string;
    orderNumber: string;
    showTitle: string;
    showDate: Date;
    showVenue: string;
    tickets: OrderTicket[];
    totalAmount: number;
    currency: string;
    status: OrderStatus;
    createdAt: Date;
}

export interface CreateOrderRequest {
    showId: string;
    tickets: {
        tierLabel: string;
        tierPrice: number;
        quantity: number;
    }[];
    userPhone?: string;
    userIdNumber?: string;
    giftCardCode?: string;
    giftCardAmountUsed?: number;
}
