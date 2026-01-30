/**
 * @file validation/schemas.ts
 * @description Zod validation schemas for API requests.
 * 
 * This module provides all validation schemas used in route handlers
 * for validating incoming request bodies, query parameters, and URL params.
 */

import { z } from 'zod';

// ==========================================
// Validation Helpers
// ==========================================

function sanitizeEmail(value: string): string {
    return value.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==========================================
// Common Schemas
// ==========================================

export const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'מזהה לא תקין');

export const emailSchema = z
    .string()
    .min(1, 'כתובת אימייל חובה')
    .transform(sanitizeEmail)
    .refine(isValidEmail, 'כתובת אימייל לא תקינה');

export const passwordSchema = z
    .string()
    .min(1, 'סיסמה חובה')
    .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים');

// ==========================================
// Auth Schemas
// ==========================================

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'טוקן חסר'),
});

// ==========================================
// User Schemas
// ==========================================

export const userRoleSchema = z.enum(['admin', 'editor']);

export const createUserSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    role: userRoleSchema,
});

export const updateUserSchema = z.object({
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    role: userRoleSchema.optional(),
});

// ==========================================
// Show Schemas
// ==========================================

export const showStatusSchema = z.enum(['available', 'sold_out', 'closed', 'few_left']);

export const ticketTierSchema = z.object({
    label: z.string().min(1, 'שם הכרטיס חסר').optional(),
    name: z.string().optional(),
    price: z.number().min(0, 'מחיר חייב להיות חיובי').optional(),
    priceNis: z.number().optional(),
    currency: z.string().default('ILS'),
    quantity: z.number().min(0).optional(),
}).transform((tier) => ({
    label: tier.label || tier.name || 'כרטיס',
    price: tier.price ?? tier.priceNis ?? 0,
    currency: tier.currency,
    quantity: tier.quantity,
}));

export const mediaIdSchema = z.string().refine(
    (val) => /^[a-fA-F0-9]{24}$/.test(val) || val.startsWith('http://') || val.startsWith('https://') || val === '',
    'מזהה מדיה לא תקין'
);

export const createShowSchema = z.object({
    title: z.string().min(1, 'כותרת חסרה'),
    slug: z.string().optional(),
    dateISO: z.string().datetime('תאריך לא תקין'),
    doorsTime: z.string().optional(),
    description: z.string().min(1, 'תיאור חסר'),
    imageMediaId: mediaIdSchema.optional(),
    status: showStatusSchema.default('available'),
    isStanding: z.boolean().optional(),
    is360: z.boolean().optional(),
    isInternational: z.boolean().optional(),
    venueName: z.string().min(1, 'שם המקום חסר'),
    venueAddress: z.string().min(1, 'כתובת חסרה'),
    ticketTiers: z.array(ticketTierSchema).min(1, 'יש להוסיף לפחות סוג כרטיס אחד'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    archived: z.boolean().default(false),
    publishDelay: z.string().optional(),
});

export const updateShowSchema = createShowSchema.partial();

export const showsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12),
    search: z.string().optional(),
    status: showStatusSchema.optional(),
    featured: z.coerce.boolean().optional(),
    archived: z.coerce.boolean().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    tags: z.string().transform(s => s.split(',')).optional(),
});

// ==========================================
// Page Schemas
// ==========================================

export const pageKeySchema = z.enum(['about', 'terms', 'accessibility', 'privacy', 'contact', 'mailing-list']);

export const updatePageSchema = z.object({
    title: z.string().min(1, 'כותרת חסרה'),
    contentRichText: z.string().min(1, 'תוכן חסר'),
    pdfMediaId: objectIdSchema.optional().nullable(),
});

// ==========================================
// Site Settings Schemas
// ==========================================

export const chandelierConfigSchema = z.object({
    enabled: z.boolean(),
    imageMediaId: objectIdSchema.optional(),
    altText: z.string(),
    placement: z.enum(['hero', 'banner', 'floating']),
    desktopSize: z.enum(['small', 'medium', 'large']),
    mobileSize: z.enum(['compact', 'hidden']),
    ariaHidden: z.boolean(),
});

export const navLinkSchema = z.object({
    label: z.string().min(1),
    href: z.string().min(1),
    external: z.boolean(),
    order: z.number().int(),
});

export const footerContentSchema = z.object({
    address: z.string(),
    phone: z.string(),
    email: emailSchema,
    socialLinks: z.array(z.object({
        platform: z.string(),
        url: z.string().url(),
    })),
    copyrightText: z.string(),
    googleMapsUrl: z.string().url().optional(),
    wazeUrl: z.string().url().optional(),
});

export const announcementSchema = z.object({
    id: z.string(),
    text: z.string(),
    enabled: z.boolean(),
    order: z.number().int(),
});

export const featuredSectionSchema = z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(['shows', 'custom']),
    showIds: z.array(objectIdSchema).optional(),
    enabled: z.boolean(),
    order: z.number().int(),
});

export const updateSiteSettingsSchema = z.object({
    chandelier: chandelierConfigSchema.optional(),
    announcements: z.array(announcementSchema).optional(),
    marqueeItems: z.array(z.string()).optional(),
    featuredSections: z.array(featuredSectionSchema).optional(),
    navLinks: z.array(navLinkSchema).optional(),
    footer: footerContentSchema.optional(),
});

// ==========================================
// Media Schemas
// ==========================================

export const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
] as const;

export const maxFileSize = 10 * 1024 * 1024; // 10MB

export const mediaQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    search: z.string().optional(),
    contentType: z.string().optional(),
});

// ==========================================
// Type Exports
// ==========================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateShowInput = z.infer<typeof createShowSchema>;
export type UpdateShowInput = z.infer<typeof updateShowSchema>;
export type ShowsQueryInput = z.infer<typeof showsQuerySchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
export type MediaQueryInput = z.infer<typeof mediaQuerySchema>;
