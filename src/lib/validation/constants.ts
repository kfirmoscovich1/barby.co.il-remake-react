/**
 * @file lib/validation/constants.ts
 * @description Validation constants and error messages used across the application.
 */

// ==========================================
// Validation Constants
// ==========================================
export const VALIDATION_RULES = {
    // Phone
    PHONE_LENGTH: 10,
    PHONE_PREFIX: '05',

    // ID Number
    ID_NUMBER_LENGTH: 9,

    // Password
    PASSWORD_MIN_LENGTH: 8,

    // Name
    NAME_MIN_LENGTH: 2,

    // Credit Card
    CARD_NUMBER_MIN_LENGTH: 13,
    CARD_NUMBER_MAX_LENGTH: 19,
    CVV_LENGTH: 3,
    CVV_AMEX_LENGTH: 4,

    // Amount
    GIFT_CARD_MIN_AMOUNT: 100,
    GIFT_CARD_MAX_AMOUNT: 5000,
} as const;

// ==========================================
// Error Messages (Hebrew)
// ==========================================
export const ERROR_MESSAGES = {
    // Required fields
    REQUIRED: 'שדה חובה',

    // Email
    EMAIL_REQUIRED: 'כתובת אימייל חובה',
    EMAIL_INVALID: 'כתובת אימייל לא תקינה',

    // Phone
    PHONE_REQUIRED: 'מספר טלפון חובה',
    PHONE_DIGITS_ONLY: 'מספר טלפון חייב להכיל ספרות בלבד',
    PHONE_MUST_START_05: 'מספר טלפון חייב להתחיל ב-05',
    PHONE_INVALID_LENGTH: `מספר טלפון חייב להכיל ${VALIDATION_RULES.PHONE_LENGTH} ספרות`,

    // Password
    PASSWORD_REQUIRED: 'סיסמה חובה',
    PASSWORD_MIN_LENGTH: `סיסמה חייבת להכיל לפחות ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} תווים`,
    PASSWORDS_DONT_MATCH: 'הסיסמאות לא תואמות',

    // ID Number
    ID_NUMBER_REQUIRED: 'תעודת זהות חובה',
    ID_NUMBER_DIGITS_ONLY: 'תעודת זהות חייבת להכיל ספרות בלבד',
    ID_NUMBER_INVALID_LENGTH: `תעודת זהות חייבת להכיל ${VALIDATION_RULES.ID_NUMBER_LENGTH} ספרות`,

    // Name
    NAME_REQUIRED: 'שדה חובה',
    NAME_MIN_LENGTH: `חייב להכיל לפחות ${VALIDATION_RULES.NAME_MIN_LENGTH} תווים`,
    FIRST_NAME_REQUIRED: 'שם פרטי חובה',
    LAST_NAME_REQUIRED: 'שם משפחה חובה',

    // Credit Card
    CARD_NUMBER_REQUIRED: 'מספר כרטיס אשראי חובה',
    CARD_NUMBER_DIGITS_ONLY: 'מספר כרטיס חייב להכיל ספרות בלבד',
    CARD_NUMBER_INVALID_LENGTH: 'מספר כרטיס אשראי לא תקין',
    CARD_NUMBER_INVALID_LUHN: 'מספר כרטיס אשראי לא תקין',

    // Card Holder
    CARD_HOLDER_REQUIRED: 'שם בעל הכרטיס חובה',

    // Expiry
    EXPIRY_REQUIRED: 'תוקף כרטיס חובה',
    EXPIRY_INVALID_FORMAT: 'פורמט תוקף לא תקין (MM/YY)',
    EXPIRY_INVALID_MONTH: 'חודש לא תקין (01-12)',
    EXPIRY_EXPIRED: 'הכרטיס פג תוקף',

    // CVV
    CVV_REQUIRED: 'קוד CVV חובה',
    CVV_DIGITS_ONLY: 'CVV חייב להכיל ספרות בלבד',
    CVV_INVALID_LENGTH: 'CVV חייב להכיל 3 או 4 ספרות',

    // Amount
    AMOUNT_MIN: (min: number) => `סכום מינימלי ${min}₪`,
    AMOUNT_MAX: (max: number) => `סכום מקסימלי ${max}₪`,
} as const;
