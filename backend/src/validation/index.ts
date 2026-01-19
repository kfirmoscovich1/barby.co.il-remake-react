/**
 * @file validation/index.ts
 * @description Centralized validation module exports for the backend.
 */

export {
    // Common schemas
    objectIdSchema,
    emailSchema,
    passwordSchema,
    // Auth schemas
    loginSchema,
    refreshTokenSchema,
    // User schemas
    userRoleSchema,
    createUserSchema,
    updateUserSchema,
    // Show schemas
    showStatusSchema,
    ticketTierSchema,
    mediaIdSchema,
    createShowSchema,
    updateShowSchema,
    showsQuerySchema,
    // Page schemas
    pageKeySchema,
    updatePageSchema,
    // Settings schemas
    chandelierConfigSchema,
    navLinkSchema,
    footerContentSchema,
    announcementSchema,
    featuredSectionSchema,
    updateSiteSettingsSchema,
    // Media schemas
    allowedMimeTypes,
    maxFileSize,
    mediaQuerySchema,
    // Types
    type LoginInput,
    type RefreshTokenInput,
    type CreateUserInput,
    type UpdateUserInput,
    type CreateShowInput,
    type UpdateShowInput,
    type ShowsQueryInput,
    type UpdatePageInput,
    type UpdateSiteSettingsInput,
    type MediaQueryInput,
} from './schemas.js';
