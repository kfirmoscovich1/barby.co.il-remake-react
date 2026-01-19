/**
 * @file lib/validation/index.ts
 * @description Centralized validation module exports.
 * 
 * This module provides:
 * - Validation constants and error messages
 * - Pure validation functions and sanitizers
 * - Zod schemas for form validation
 * - React input handlers for form fields
 */

// Constants
export { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

// Validators and sanitizers
export {
    sanitizeDigitsOnly,
    sanitizePhone,
    sanitizeEmail,
    sanitizeCardNumber,
    formatPhoneDisplay,
    formatCardNumberDisplay,
    formatExpiryDisplay,
    formatCvvDisplay,
    formatIdNumberDisplay,
    isValidIsraeliPhone,
    isValidEmail,
    luhnCheck,
    isValidCardNumber,
    isAmexCard,
    isValidExpiry,
    isValidCvv,
    isValidIdNumber,
    isValidPassword,
} from './validators';

// Schemas and types
export {
    // Base schemas
    phoneSchema,
    phoneSchemaOptional,
    emailSchema,
    passwordSchema,
    idNumberSchema,
    nameSchema,
    firstNameSchema,
    lastNameSchema,
    cardNumberSchema,
    cardHolderSchema,
    cardExpirySchema,
    cvvSchema,
    cvv3Schema,
    objectIdSchema,
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
    // Form schemas
    loginFormSchema,
    registerFormSchema,
    forgotPasswordFormSchema,
    changePasswordFormSchema,
    giftCardFormSchema,
    paymentFormSchema,
    checkoutFormSchema,
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
    type LoginFormInput,
    type RegisterFormInput,
    type ForgotPasswordFormInput,
    type ChangePasswordFormInput,
    type GiftCardFormInput,
    type PaymentFormInput,
    type CheckoutFormInput,
} from './schemas';

// Input handlers
export {
    handlePhoneInput,
    handlePhoneInputFormatted,
    handleEmailInput,
    handleCardNumberInput,
    handleExpiryInput,
    handleCvvInput,
    handleIdNumberInput,
} from './handlers';

// Legacy compatibility exports - direct function references
import {
    isValidEmail,
    isValidIsraeliPhone,
    isValidCardNumber,
    isValidExpiry,
    isValidCvv,
    isValidIdNumber,
    isValidPassword,
} from './validators';

export const validateEmail = isValidEmail;
export const validatePhone = isValidIsraeliPhone;
export const validateCardNumber = isValidCardNumber;
export const validateExpiry = isValidExpiry;
export const validateCvv = isValidCvv;
export const validateIdNumber = isValidIdNumber;
export const validatePassword = isValidPassword;
