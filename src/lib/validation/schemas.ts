/**
 * @file lib/validation/schemas.ts
 * @description Zod validation schemas for forms and API requests.
 */

import { z } from 'zod';
import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';
import {
    sanitizePhone,
    sanitizeEmail,
    sanitizeDigitsOnly,
    sanitizeCardNumber,
    isValidIsraeliPhone,
    isValidEmail,
    isValidExpiry,
    luhnCheck,
} from './validators';

// ==========================================
// Base Schemas
// ==========================================

/**
 * Israeli phone number schema
 */
export const phoneSchema = z
    .string()
    .min(1, ERROR_MESSAGES.PHONE_REQUIRED)
    .transform(sanitizePhone)
    .refine((val) => /^\d+$/.test(val), ERROR_MESSAGES.PHONE_DIGITS_ONLY)
    .refine((val) => val.startsWith(VALIDATION_RULES.PHONE_PREFIX), ERROR_MESSAGES.PHONE_MUST_START_05)
    .refine((val) => val.length === VALIDATION_RULES.PHONE_LENGTH, ERROR_MESSAGES.PHONE_INVALID_LENGTH);

/**
 * Optional phone schema
 */
export const phoneSchemaOptional = z
    .string()
    .optional()
    .transform((val) => val ? sanitizePhone(val) : undefined)
    .refine(
        (val) => !val || isValidIsraeliPhone(val),
        ERROR_MESSAGES.PHONE_INVALID_LENGTH
    );

/**
 * Email schema
 */
export const emailSchema = z
    .string()
    .min(1, ERROR_MESSAGES.EMAIL_REQUIRED)
    .transform(sanitizeEmail)
    .refine(isValidEmail, ERROR_MESSAGES.EMAIL_INVALID);

/**
 * Password schema
 */
export const passwordSchema = z
    .string()
    .min(1, ERROR_MESSAGES.PASSWORD_REQUIRED)
    .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, ERROR_MESSAGES.PASSWORD_MIN_LENGTH);

/**
 * ID number schema
 */
export const idNumberSchema = z
    .string()
    .min(1, ERROR_MESSAGES.ID_NUMBER_REQUIRED)
    .transform(sanitizeDigitsOnly)
    .refine((val) => /^\d+$/.test(val), ERROR_MESSAGES.ID_NUMBER_DIGITS_ONLY)
    .refine((val) => val.length === VALIDATION_RULES.ID_NUMBER_LENGTH, ERROR_MESSAGES.ID_NUMBER_INVALID_LENGTH);

/**
 * Name schema
 */
export const nameSchema = z
    .string()
    .min(1, ERROR_MESSAGES.NAME_REQUIRED)
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, ERROR_MESSAGES.NAME_MIN_LENGTH);

/**
 * First name schema
 */
export const firstNameSchema = z
    .string()
    .min(1, ERROR_MESSAGES.FIRST_NAME_REQUIRED)
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, ERROR_MESSAGES.NAME_MIN_LENGTH);

/**
 * Last name schema
 */
export const lastNameSchema = z
    .string()
    .min(1, ERROR_MESSAGES.LAST_NAME_REQUIRED)
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, ERROR_MESSAGES.NAME_MIN_LENGTH);

/**
 * Credit card number schema
 */
export const cardNumberSchema = z
    .string()
    .min(1, ERROR_MESSAGES.CARD_NUMBER_REQUIRED)
    .transform(sanitizeCardNumber)
    .refine((val) => /^\d+$/.test(val), ERROR_MESSAGES.CARD_NUMBER_DIGITS_ONLY)
    .refine(
        (val) => val.length >= VALIDATION_RULES.CARD_NUMBER_MIN_LENGTH && val.length <= VALIDATION_RULES.CARD_NUMBER_MAX_LENGTH,
        ERROR_MESSAGES.CARD_NUMBER_INVALID_LENGTH
    )
    .refine(luhnCheck, ERROR_MESSAGES.CARD_NUMBER_INVALID_LUHN);

/**
 * Card holder name schema
 */
export const cardHolderSchema = z
    .string()
    .min(1, ERROR_MESSAGES.CARD_HOLDER_REQUIRED);

/**
 * Card expiry schema (MM/YY)
 */
export const cardExpirySchema = z
    .string()
    .min(1, ERROR_MESSAGES.EXPIRY_REQUIRED)
    .refine((val) => /^\d{2}\/\d{2}$/.test(val.replace(/\s/g, '')), ERROR_MESSAGES.EXPIRY_INVALID_FORMAT)
    .refine((val) => {
        const match = val.match(/^(\d{2})\//);
        if (!match) return false;
        const month = parseInt(match[1], 10);
        return month >= 1 && month <= 12;
    }, ERROR_MESSAGES.EXPIRY_INVALID_MONTH)
    .refine(isValidExpiry, ERROR_MESSAGES.EXPIRY_EXPIRED);

/**
 * CVV schema (3 or 4 digits)
 */
export const cvvSchema = z
    .string()
    .min(1, ERROR_MESSAGES.CVV_REQUIRED)
    .transform(sanitizeDigitsOnly)
    .refine((val) => /^\d+$/.test(val), ERROR_MESSAGES.CVV_DIGITS_ONLY)
    .refine((val) => val.length === 3 || val.length === 4, ERROR_MESSAGES.CVV_INVALID_LENGTH);

/**
 * CVV schema (3 digits only)
 */
export const cvv3Schema = z
    .string()
    .min(1, ERROR_MESSAGES.CVV_REQUIRED)
    .transform(sanitizeDigitsOnly)
    .refine((val) => /^\d+$/.test(val), ERROR_MESSAGES.CVV_DIGITS_ONLY)
    .refine((val) => val.length === 3, ERROR_MESSAGES.CVV_INVALID_LENGTH);

// ==========================================
// Common Schemas
// ==========================================

export const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'מזהה לא תקין');

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
// Form Schemas
// ==========================================

/**
 * Login form schema
 */
export const loginFormSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

/**
 * Register form schema
 */
export const registerFormSchema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    idNumber: idNumberSchema,
    phone: phoneSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, ERROR_MESSAGES.PASSWORD_REQUIRED),
}).refine((data) => data.password === data.confirmPassword, {
    message: ERROR_MESSAGES.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
});

/**
 * Forgot password form schema
 */
export const forgotPasswordFormSchema = z.object({
    email: emailSchema,
});

/**
 * Change password form schema
 */
export const changePasswordFormSchema = z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, ERROR_MESSAGES.PASSWORD_REQUIRED),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: ERROR_MESSAGES.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
});

/**
 * Gift card form schema
 */
export const giftCardFormSchema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    phone: phoneSchemaOptional,
    amount: z.number()
        .min(VALIDATION_RULES.GIFT_CARD_MIN_AMOUNT, ERROR_MESSAGES.AMOUNT_MIN(VALIDATION_RULES.GIFT_CARD_MIN_AMOUNT))
        .max(VALIDATION_RULES.GIFT_CARD_MAX_AMOUNT, ERROR_MESSAGES.AMOUNT_MAX(VALIDATION_RULES.GIFT_CARD_MAX_AMOUNT)),
    message: z.string().max(500, 'ההודעה ארוכה מדי').optional(),
    isForSelf: z.boolean().optional(),
});

/**
 * Payment form schema
 */
export const paymentFormSchema = z.object({
    cardNumber: cardNumberSchema,
    cardHolder: cardHolderSchema,
    cardExpiry: cardExpirySchema,
    cardCvv: cvvSchema,
});

/**
 * Checkout form schema (personal details + payment)
 */
export const checkoutFormSchema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    idNumber: idNumberSchema,
    email: emailSchema,
    phone: phoneSchema,
    cardNumber: cardNumberSchema,
    cardHolder: cardHolderSchema,
    cardExpiry: cardExpirySchema,
    cardCvv: cvvSchema,
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
export type LoginFormInput = z.infer<typeof loginFormSchema>;
export type RegisterFormInput = z.infer<typeof registerFormSchema>;
export type ForgotPasswordFormInput = z.infer<typeof forgotPasswordFormSchema>;
export type ChangePasswordFormInput = z.infer<typeof changePasswordFormSchema>;
export type GiftCardFormInput = z.infer<typeof giftCardFormSchema>;
export type PaymentFormInput = z.infer<typeof paymentFormSchema>;
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
