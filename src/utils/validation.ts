/**
 * @file validation.ts
 * @description Frontend validation utilities - re-exports from local validation library
 * and adds frontend-specific input handling functions.
 * 
 * All validation logic is centralized in @/lib/validation for consistency.
 */

// Re-export everything from local validation module
export * from '@/lib/validation';

// Import specific items for frontend-specific utilities
import {
    sanitizePhone,
    formatPhoneDisplay,
    formatCardNumberDisplay,
    formatExpiryDisplay,
    formatCvvDisplay,
    formatIdNumberDisplay,
    isValidIsraeliPhone,
    isValidEmail,
    isValidCardNumber,
    isValidExpiry,
    isValidCvv,
    isValidIdNumber,
    isValidPassword,
    isAmexCard,
    VALIDATION_RULES,
} from '@/lib/validation';

// ==========================================
// Input Event Handlers for React
// ==========================================

/**
 * Handle phone input - sanitize and format
 */
export function handlePhoneInput(value: string): string {
    const digits = sanitizePhone(value);
    // Limit to 10 digits
    return digits.slice(0, VALIDATION_RULES.PHONE_LENGTH);
}

/**
 * Handle phone input with display formatting
 */
export function handlePhoneInputFormatted(value: string): string {
    return formatPhoneDisplay(value);
}

/**
 * Handle email input - trim spaces
 */
export function handleEmailInput(value: string): string {
    // Don't lowercase during input, only on submit
    return value.replace(/\s/g, '');
}

/**
 * Handle credit card number input - sanitize and format with spaces
 */
export function handleCardNumberInput(value: string): string {
    return formatCardNumberDisplay(value);
}

/**
 * Handle card expiry input - auto-format MM/YY
 */
export function handleExpiryInput(value: string): string {
    return formatExpiryDisplay(value);
}

/**
 * Handle CVV input
 */
export function handleCvvInput(value: string, cardNumber?: string): string {
    const maxLength = cardNumber && isAmexCard(cardNumber)
        ? VALIDATION_RULES.CVV_AMEX_LENGTH
        : VALIDATION_RULES.CVV_LENGTH;
    return formatCvvDisplay(value, maxLength);
}

/**
 * Handle ID number input
 */
export function handleIdNumberInput(value: string): string {
    return formatIdNumberDisplay(value);
}

// ==========================================
// Validation Helpers (legacy compatibility)
// ==========================================

/**
 * Validate email (legacy function name compatibility)
 */
export function validateEmail(email: string): boolean {
    return isValidEmail(email);
}

/**
 * Validate phone (legacy function name compatibility)
 */
export function validatePhone(phone: string): boolean {
    return isValidIsraeliPhone(phone);
}

/**
 * Validate ID number (legacy function name compatibility)
 */
export function validateIdNumber(idNumber: string): boolean {
    return isValidIdNumber(idNumber);
}

/**
 * Validate card number (legacy function name compatibility)
 */
export function validateCardNumber(cardNumber: string): boolean {
    return isValidCardNumber(cardNumber);
}

/**
 * Validate expiry (legacy function name compatibility)
 */
export function validateExpiry(expiry: string): boolean {
    return isValidExpiry(expiry);
}

/**
 * Validate CVV (legacy function name compatibility)
 */
export function validateCvv(cvv: string): boolean {
    return isValidCvv(cvv, true); // Allow 3 or 4 digits
}

/**
 * Validate password (legacy function name compatibility)
 */
export function validatePassword(password: string): boolean {
    return isValidPassword(password);
}

// ==========================================
// Input Props Helpers
// ==========================================

/**
 * Get input props for phone field
 */
export function getPhoneInputProps() {
    return {
        type: 'tel' as const,
        inputMode: 'numeric' as const,
        pattern: '[0-9]*',
        maxLength: VALIDATION_RULES.PHONE_LENGTH,
        placeholder: '05XXXXXXXX',
        autoComplete: 'tel',
    };
}

/**
 * Get input props for email field
 */
export function getEmailInputProps() {
    return {
        type: 'email' as const,
        inputMode: 'email' as const,
        autoComplete: 'email',
        placeholder: 'name@domain.com',
    };
}

/**
 * Get input props for credit card number field
 */
export function getCardNumberInputProps() {
    return {
        type: 'text' as const,
        inputMode: 'numeric' as const,
        pattern: '[0-9 ]*',
        maxLength: 23, // 19 digits + 4 spaces
        placeholder: '1234 5678 9012 3456',
        autoComplete: 'cc-number',
    };
}

/**
 * Get input props for card expiry field
 */
export function getExpiryInputProps() {
    return {
        type: 'text' as const,
        inputMode: 'numeric' as const,
        pattern: '[0-9/]*',
        maxLength: 5,
        placeholder: 'MM/YY',
        autoComplete: 'cc-exp',
    };
}

/**
 * Get input props for CVV field
 */
export function getCvvInputProps(isAmex: boolean = false) {
    return {
        type: 'text' as const,
        inputMode: 'numeric' as const,
        pattern: '[0-9]*',
        maxLength: isAmex ? VALIDATION_RULES.CVV_AMEX_LENGTH : VALIDATION_RULES.CVV_LENGTH,
        placeholder: isAmex ? '1234' : '123',
        autoComplete: 'cc-csc',
    };
}

/**
 * Get input props for ID number field
 */
export function getIdNumberInputProps() {
    return {
        type: 'text' as const,
        inputMode: 'numeric' as const,
        pattern: '[0-9]*',
        maxLength: VALIDATION_RULES.ID_NUMBER_LENGTH,
        placeholder: '123456789',
    };
}

/**
 * Get input props for password field
 */
export function getPasswordInputProps() {
    return {
        type: 'password' as const,
        autoComplete: 'current-password',
        minLength: VALIDATION_RULES.PASSWORD_MIN_LENGTH,
    };
}

/**
 * Get input props for new password field
 */
export function getNewPasswordInputProps() {
    return {
        type: 'password' as const,
        autoComplete: 'new-password',
        minLength: VALIDATION_RULES.PASSWORD_MIN_LENGTH,
    };
}
