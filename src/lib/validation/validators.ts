/**
 * @file lib/validation/validators.ts
 * @description Pure validation functions and sanitizers for form inputs.
 */

import { VALIDATION_RULES } from './constants';

// ==========================================
// Sanitization Functions
// ==========================================

/**
 * Remove all non-digit characters from a string
 */
export function sanitizeDigitsOnly(value: string): string {
    return value.replace(/\D/g, '');
}

/**
 * Sanitize phone number - remove non-digits
 */
export function sanitizePhone(value: string): string {
    return sanitizeDigitsOnly(value);
}

/**
 * Sanitize email - trim and lowercase
 */
export function sanitizeEmail(value: string): string {
    return value.trim().toLowerCase();
}

/**
 * Sanitize credit card number - remove spaces and non-digits
 */
export function sanitizeCardNumber(value: string): string {
    return sanitizeDigitsOnly(value);
}

/**
 * Format phone number for display (05X-XXX-XXXX)
 */
export function formatPhoneDisplay(value: string): string {
    const digits = sanitizeDigitsOnly(value).slice(0, VALIDATION_RULES.PHONE_LENGTH);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Format credit card number for display (groups of 4)
 */
export function formatCardNumberDisplay(value: string): string {
    const digits = sanitizeDigitsOnly(value).slice(0, VALIDATION_RULES.CARD_NUMBER_MAX_LENGTH);
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join(' ');
}

/**
 * Format card expiry for display (MM/YY)
 */
export function formatExpiryDisplay(value: string): string {
    const digits = sanitizeDigitsOnly(value).slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/**
 * Format CVV for input (max digits)
 */
export function formatCvvDisplay(value: string, maxLength: number = VALIDATION_RULES.CVV_LENGTH): string {
    return sanitizeDigitsOnly(value).slice(0, maxLength);
}

/**
 * Format ID number for input (max 9 digits)
 */
export function formatIdNumberDisplay(value: string): string {
    return sanitizeDigitsOnly(value).slice(0, VALIDATION_RULES.ID_NUMBER_LENGTH);
}

// ==========================================
// Validation Functions
// ==========================================

/**
 * Validate Israeli phone number
 * - Must contain digits only
 * - Must start with 05
 * - Must be exactly 10 digits
 */
export function isValidIsraeliPhone(phone: string): boolean {
    const sanitized = sanitizePhone(phone);
    return (
        sanitized.length === VALIDATION_RULES.PHONE_LENGTH &&
        sanitized.startsWith(VALIDATION_RULES.PHONE_PREFIX) &&
        /^\d+$/.test(sanitized)
    );
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
    const sanitized = sanitizeEmail(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized);
}

/**
 * Luhn algorithm for credit card validation
 */
export function luhnCheck(cardNumber: string): boolean {
    const digits = sanitizeCardNumber(cardNumber);
    if (!/^\d+$/.test(digits)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

/**
 * Validate credit card number
 * - Digits only
 * - 13-19 digits
 * - Passes Luhn check
 */
export function isValidCardNumber(cardNumber: string): boolean {
    const sanitized = sanitizeCardNumber(cardNumber);

    if (!/^\d+$/.test(sanitized)) return false;
    if (sanitized.length < VALIDATION_RULES.CARD_NUMBER_MIN_LENGTH) return false;
    if (sanitized.length > VALIDATION_RULES.CARD_NUMBER_MAX_LENGTH) return false;

    return luhnCheck(sanitized);
}

/**
 * Detect if card is AMEX (starts with 34 or 37)
 */
export function isAmexCard(cardNumber: string): boolean {
    const sanitized = sanitizeCardNumber(cardNumber);
    return sanitized.startsWith('34') || sanitized.startsWith('37');
}

/**
 * Validate card expiry date
 * - Format: MM/YY
 * - Month: 01-12
 * - Not expired
 */
export function isValidExpiry(expiry: string): boolean {
    const cleaned = expiry.replace(/\s/g, '');
    const match = cleaned.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;

    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
}

/**
 * Validate CVV
 * - Digits only
 * - 3 digits (or 4 for AMEX)
 */
export function isValidCvv(cvv: string, allowFourDigits: boolean = false): boolean {
    const sanitized = sanitizeDigitsOnly(cvv);

    if (!/^\d+$/.test(sanitized)) return false;

    if (allowFourDigits) {
        return sanitized.length === 3 || sanitized.length === 4;
    }

    return sanitized.length === 3;
}

/**
 * Validate Israeli ID number (basic check - 9 digits)
 */
export function isValidIdNumber(idNumber: string): boolean {
    const sanitized = sanitizeDigitsOnly(idNumber);
    return sanitized.length === VALIDATION_RULES.ID_NUMBER_LENGTH && /^\d+$/.test(sanitized);
}

/**
 * Validate password
 */
export function isValidPassword(password: string): boolean {
    return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
}
