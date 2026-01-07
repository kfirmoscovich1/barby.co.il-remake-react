/**
 * @file lib/validation/handlers.ts
 * @description React input event handlers for form fields.
 * These handlers provide consistent input formatting across all forms.
 */

import { VALIDATION_RULES } from './constants';
import {
    sanitizePhone,
    formatPhoneDisplay,
    formatCardNumberDisplay,
    formatExpiryDisplay,
    formatCvvDisplay,
    formatIdNumberDisplay,
    isAmexCard,
} from './validators';

// ==========================================
// Input Event Handlers for React
// ==========================================

/**
 * Handle phone input - sanitize and format
 */
export function handlePhoneInput(value: string): string {
    const digits = sanitizePhone(value);
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
