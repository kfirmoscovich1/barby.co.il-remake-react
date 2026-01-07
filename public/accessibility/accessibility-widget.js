/**
 * Accessibility Widget
 * A modern, full-panel accessibility plugin for websites
 * Supports: Hebrew, English, Spanish
 * 
 * Usage: 
 * <link rel="stylesheet" href="accessibility-widget.css">
 * <script src="accessibility-widget.js" data-lang="he"></script>
 * 
 * Options for data-lang: "he" (Hebrew), "en" (English), "es" (Spanish)
 */

(function () {
    'use strict';

    // ============================================
    // TRANSLATIONS
    // ============================================
    const translations = {
        he: {
            title: 'כלי נגישות',
            close: 'סגור',
            reset: 'איפוס הגדרות',
            // Visual modes
            nightMode: 'מצב לילה',
            highContrast: 'ניגודיות גבוהה',
            lightBackground: 'רקע בהיר',
            // Cursor
            whiteCursor: 'סמן לבן',
            blackCursor: 'סמן שחור',
            // Links
            highlightLinks: 'הדגשת קישורים',
            // Font size
            fontSize: 'התאמת גודל גופן',
            decreaseText: 'הקטנת טקסט',
            resetSize: 'איפוס גודל',
            increaseText: 'הגדלת טקסט',
            // Word spacing
            wordSpacing: 'התאמת ריווח בין מילים',
            decreaseSpacing: 'הקטנת ריווח',
            resetSpacing: 'איפוס ריווח',
            increaseSpacing: 'הגדלת ריווח',
            // Letter spacing
            letterSpacing: 'התאמת ריווח בין אותיות',
            // Features
            keyboardNav: 'ניווט מקלדת',
            screenMask: 'מסיכת מסך',
            readableFont: 'גופן קריא',
            readingGuide: 'סרגל קריאה',
            bigCursorLight: 'סמן גדול בהיר',
            bigCursorDark: 'סמן גדול כהה',
            stopAnimations: 'ביטול אנימציות',
            highlightHeadings: 'הדגשת כותרות',
            lineHeight: 'גובה שורה',
            monochrome: 'שחור-לבן',
            // New features
            magnifier: 'זכוכית מגדלת',
            invertColors: 'היפוך צבעים',
            lowSaturation: 'רוויה נמוכה',
            textToSpeech: 'הקראת טקסט',
            focusHighlight: 'הדגשת פוקוס',
            formHighlight: 'הדגשת טפסים',
            hideImages: 'הסתרת תמונות',
            underlineLinks: 'קו תחתון לקישורים',
            lineMask: 'מסכת שורה',
            textCursor: 'סמן טקסט גדול',
            alignCenter: 'יישור למרכז',
            alignLeft: 'יישור לשמאל',
            alignRight: 'יישור לימין'
        },
        en: {
            title: 'Accessibility Tools',
            close: 'Close',
            reset: 'Reset Settings',
            // Visual modes
            nightMode: 'Night Mode',
            highContrast: 'High Contrast',
            lightBackground: 'Light Background',
            // Cursor
            whiteCursor: 'White Cursor',
            blackCursor: 'Black Cursor',
            // Links
            highlightLinks: 'Highlight Links',
            // Font size
            fontSize: 'Adjust Font Size',
            decreaseText: 'Decrease Text',
            resetSize: 'Reset Size',
            increaseText: 'Increase Text',
            // Word spacing
            wordSpacing: 'Adjust Word Spacing',
            decreaseSpacing: 'Decrease Spacing',
            resetSpacing: 'Reset Spacing',
            increaseSpacing: 'Increase Spacing',
            // Letter spacing
            letterSpacing: 'Adjust Letter Spacing',
            // Features
            keyboardNav: 'Keyboard Nav',
            screenMask: 'Screen Mask',
            readableFont: 'Readable Font',
            readingGuide: 'Reading Guide',
            bigCursorLight: 'Light Big Cursor',
            bigCursorDark: 'Dark Big Cursor',
            stopAnimations: 'Stop Animations',
            highlightHeadings: 'Highlight Headings',
            lineHeight: 'Line Height',
            monochrome: 'Monochrome',
            // New features
            magnifier: 'Magnifier',
            invertColors: 'Invert Colors',
            lowSaturation: 'Low Saturation',
            textToSpeech: 'Text to Speech',
            focusHighlight: 'Focus Highlight',
            formHighlight: 'Form Highlight',
            hideImages: 'Hide Images',
            underlineLinks: 'Underline Links',
            lineMask: 'Line Mask',
            textCursor: 'Big Text Cursor',
            alignCenter: 'Align Center',
            alignLeft: 'Align Left',
            alignRight: 'Align Right'
        },
        es: {
            title: 'Herramientas de Accesibilidad',
            close: 'Cerrar',
            reset: 'Restablecer',
            // Visual modes
            nightMode: 'Modo Noche',
            highContrast: 'Alto Contraste',
            lightBackground: 'Fondo Claro',
            // Cursor
            whiteCursor: 'Cursor Blanco',
            blackCursor: 'Cursor Negro',
            // Links
            highlightLinks: 'Resaltar Enlaces',
            // Font size
            fontSize: 'Ajustar Tamaño de Fuente',
            decreaseText: 'Reducir Texto',
            resetSize: 'Restablecer',
            increaseText: 'Aumentar Texto',
            // Word spacing
            wordSpacing: 'Espaciado de Palabras',
            decreaseSpacing: 'Reducir Espacio',
            resetSpacing: 'Restablecer',
            increaseSpacing: 'Aumentar Espacio',
            // Letter spacing
            letterSpacing: 'Espaciado de Letras',
            // Features
            keyboardNav: 'Nav. Teclado',
            screenMask: 'Máscara Pantalla',
            readableFont: 'Fuente Legible',
            readingGuide: 'Guía de Lectura',
            bigCursorLight: 'Cursor Grande Claro',
            bigCursorDark: 'Cursor Grande Oscuro',
            stopAnimations: 'Detener Animaciones',
            highlightHeadings: 'Resaltar Títulos',
            lineHeight: 'Altura de Línea',
            monochrome: 'Monocromo',
            // New features
            magnifier: 'Lupa',
            invertColors: 'Invertir Colores',
            lowSaturation: 'Baja Saturación',
            textToSpeech: 'Texto a Voz',
            focusHighlight: 'Resaltar Foco',
            formHighlight: 'Resaltar Formularios',
            hideImages: 'Ocultar Imágenes',
            underlineLinks: 'Subrayar Enlaces',
            lineMask: 'Máscara de Línea',
            textCursor: 'Cursor Texto Grande',
            alignCenter: 'Alinear Centro',
            alignLeft: 'Alinear Izquierda',
            alignRight: 'Alinear Derecha'
        }
    };

    // ============================================
    // CONFIGURATION
    // ============================================
    const scriptTag = document.currentScript;
    const lang = scriptTag?.getAttribute('data-lang') || 'he';
    const t = translations[lang] || translations.he;
    const isRTL = lang === 'he';
    const direction = isRTL ? 'rtl' : 'ltr';

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    let state = {
        textSize: 0,
        wordSpacing: 0,
        letterSpacing: 0,
        nightMode: false,
        highContrast: false,
        lightBackground: false,
        highlightLinks: false,
        readableFont: false,
        readingGuide: false,
        stopAnimations: false,
        bigCursorLight: false,
        bigCursorDark: false,
        keyboardNav: false,
        screenMask: false,
        highlightHeadings: false,
        lineHeight: false,
        monochrome: false,
        // New features
        magnifier: false,
        invertColors: false,
        lowSaturation: false,
        textToSpeech: false,
        focusHighlight: false,
        formHighlight: false,
        hideImages: false,
        underlineLinks: false,
        lineMask: false,
        textCursor: false,
        alignCenter: false,
        alignLeft: false,
        alignRight: false
    };

    function loadState() {
        try {
            const saved = localStorage.getItem('accessibilityWidgetState');
            if (saved) {
                state = { ...state, ...JSON.parse(saved) };
            }
        } catch (e) {
            // Silent fail - accessibility settings couldn't be loaded
        }
    }

    function saveState() {
        try {
            localStorage.setItem('accessibilityWidgetState', JSON.stringify(state));
        } catch (e) {
            // Silent fail - accessibility settings couldn't be saved
        }
    }

    // ============================================
    // ICONS
    // ============================================
    const icons = {
        accessibility: `<svg viewBox="0 0 24 24"><path fill="#000000" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V22H13V16H11V22H9V9H3V7H21V9Z"/></svg>`,
        close: `<svg viewBox="0 0 24 24"><path fill="#1e3a5f" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
        reset: `<svg viewBox="0 0 24 24"><path fill="#1e3a5f" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`,
        nightMode: `<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>`,
        contrast: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"/></svg>`,
        lightBg: `<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`,
        cursorWhite: `<svg viewBox="0 0 24 24"><path d="M13.64 21.97C13.14 22.21 12.54 22 12.31 21.5L10.13 16.76 7.62 18.78C7.45 18.92 7.24 19 7.02 19C6.55 19 6.16 18.61 6.16 18.14V5.86C6.16 5.39 6.55 5 7.02 5C7.24 5 7.45 5.08 7.62 5.22L18.09 14.21C18.45 14.5 18.53 15.03 18.26 15.41C18.12 15.6 17.92 15.72 17.69 15.75L13.99 16.3L16.17 21.04C16.41 21.54 16.21 22.14 15.7 22.38L13.64 21.97Z" fill="#fff" stroke="#ffa614" stroke-width="2.5"/></svg>`,
        cursorBlack: `<svg viewBox="0 0 24 24"><path d="M13.64 21.97C13.14 22.21 12.54 22 12.31 21.5L10.13 16.76 7.62 18.78C7.45 18.92 7.24 19 7.02 19C6.55 19 6.16 18.61 6.16 18.14V5.86C6.16 5.39 6.55 5 7.02 5C7.24 5 7.45 5.08 7.62 5.22L18.09 14.21C18.45 14.5 18.53 15.03 18.26 15.41C18.12 15.6 17.92 15.72 17.69 15.75L13.99 16.3L16.17 21.04C16.41 21.54 16.21 22.14 15.7 22.38L13.64 21.97Z" fill="#000" stroke="#000" stroke-width="2.5"/></svg>`,
        links: `<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
        keyboard: `<svg viewBox="0 0 24 24"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>`,
        screenMask: `<svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9 8h6v2H9V8zm-3 4h12v2H6v-2z"/></svg>`,
        font: `<svg viewBox="0 0 24 24"><path d="M9.93 13.5h4.14L12 7.98 9.93 13.5zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z"/></svg>`,
        guide: `<svg viewBox="0 0 24 24"><path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z"/></svg>`,
        animation: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`,
        headings: `<svg viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4H5z"/></svg>`,
        lineHeight: `<svg viewBox="0 0 24 24"><path d="M9.17 15.5h5.64l1.14 3h2.09l-5.11-13h-1.86l-5.11 13h2.09l1.12-3zM12 7.98l2.07 5.52H9.93L12 7.98zM21 2H3v2h18V2zm0 18H3v2h18v-2z"/></svg>`,
        monochrome: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="5"/></svg>`,
        minus: `<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>`,
        plus: `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
        // New icons
        magnifier: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>`,
        invertColors: `<svg viewBox="0 0 24 24"><path d="M12 4.81V19c-3.31 0-6-2.63-6-5.87 0-1.56.62-3.03 1.75-4.14L12 4.81M6.35 7.56C4.9 8.99 4 10.96 4 13.13 4 17.48 7.58 21 12 21s8-3.52 8-7.87c0-2.17-.9-4.14-2.35-5.57L12 2 6.35 7.56z"/></svg>`,
        lowSaturation: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z"/></svg>`,
        textToSpeech: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
        focusHighlight: `<svg viewBox="0 0 24 24"><path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`,
        formHighlight: `<svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>`,
        hideImages: `<svg viewBox="0 0 24 24"><path d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z"/><path d="M2.5 4.27l1.64 1.64-.14.09v12c0 1.1.9 2 2 2h12l1.5 1.5 1.41-1.41L3.91 2.86 2.5 4.27z"/></svg>`,
        underlineLinks: `<svg viewBox="0 0 24 24"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>`,
        lineMask: `<svg viewBox="0 0 24 24"><path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 14H5v-3h14v3zm0-5H5v-2h14v2zm0-4H5V5h14v5z"/></svg>`,
        textCursor: `<svg viewBox="0 0 24 24"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/></svg>`,
        alignCenter: `<svg viewBox="0 0 24 24"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>`,
        alignLeft: `<svg viewBox="0 0 24 24"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>`,
        alignRight: `<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>`
    };

    // ============================================
    // CREATE WIDGET
    // ============================================
    function createWidget() {
        // Create content wrapper for filter effects
        // This wrapper will contain all original page content
        // Filter effects will be applied to this wrapper instead of body
        // to prevent breaking position:fixed on widget elements
        let contentWrapper = document.getElementById('acc-content-wrapper');
        if (!contentWrapper) {
            contentWrapper = document.createElement('div');
            contentWrapper.id = 'acc-content-wrapper';
            contentWrapper.style.cssText = 'min-height: 100%; width: 100%;';

            // Move all existing body children into the wrapper
            while (document.body.firstChild) {
                contentWrapper.appendChild(document.body.firstChild);
            }
            document.body.appendChild(contentWrapper);
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'acc-widget-overlay';
        document.body.appendChild(overlay);

        // Create main button

        let mainBtn;
        function ensureMainBtn() {
            mainBtn = document.querySelector('.acc-widget-btn');
            if (!mainBtn) {
                mainBtn = document.createElement('button');
                mainBtn.className = `acc-widget-btn ${direction}`;
                mainBtn.setAttribute('aria-label', t.title);
                mainBtn.setAttribute('title', t.title);
                mainBtn.innerHTML = icons.accessibility;
                document.body.appendChild(mainBtn);
            }
            // Always force visible and fixed position
            mainBtn.style.display = 'flex';
            mainBtn.style.opacity = '1';
            mainBtn.style.pointerEvents = 'auto';
            mainBtn.style.position = 'fixed';
            mainBtn.style.bottom = '8px';
            mainBtn.style.left = '8px';
            mainBtn.style.right = 'auto';
            mainBtn.style.width = '32px';
            mainBtn.style.height = '32px';
            mainBtn.style.zIndex = '2147483647';
            mainBtn.style.outline = 'none';
            // Force gold background
            mainBtn.style.setProperty('background', '#ffa614', 'important');
            mainBtn.style.setProperty('background-image', 'none', 'important');
            // Set icon color to black
            const icon = mainBtn.querySelector('svg');
            if (icon) {
                icon.style.fill = '#000000';
            }
        }

        ensureMainBtn();
        // MutationObserver to re-insert button if removed
        const observer = new MutationObserver(() => {
            ensureMainBtn();
        });
        observer.observe(document.body, { childList: true });

        // --- Hide button when menu/nav is open or panel is open (JS fallback for aggressive CSS) ---
        function updateBtnVisibility() {
            const btn = document.querySelector('.acc-widget-btn');
            if (!btn) return;
            const body = document.body;
            const accPanel = document.querySelector('.acc-widget-panel');
            const isPanelOpen = accPanel && accPanel.classList.contains('open');
            if (body.classList.contains('menu-open') || body.classList.contains('nav-open') || isPanelOpen) {
                btn.style.setProperty('display', 'none', 'important');
            } else {
                btn.style.setProperty('display', 'flex', 'important');
            }
        }
        // Observe class changes on body
        const bodyObserver = new MutationObserver(() => updateBtnVisibility());
        bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        // Initial check
        updateBtnVisibility();

        // Create panel
        const panel = document.createElement('div');
        panel.className = `acc-widget-panel ${direction}`;
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', t.title);
        panel.setAttribute('aria-modal', 'true');

        panel.innerHTML = `
            <div class="acc-widget-header">
                <h2>${t.title}</h2>
                <button class="acc-widget-close" aria-label="${t.close}">${icons.close}</button>
            </div>
            <div class="acc-widget-body">
                <!-- Top Toggle Buttons - 3 columns -->
                <div class="acc-widget-grid-3">
                    <button class="acc-widget-toggle" data-feature="nightMode" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.nightMode}</span>
                        <span class="acc-widget-toggle-label">${t.nightMode}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="highContrast" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.contrast}</span>
                        <span class="acc-widget-toggle-label">${t.highContrast}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="lightBackground" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.lightBg}</span>
                        <span class="acc-widget-toggle-label">${t.lightBackground}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="bigCursorLight" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.cursorWhite}</span>
                        <span class="acc-widget-toggle-label">${t.whiteCursor}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="highlightLinks" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.links}</span>
                        <span class="acc-widget-toggle-label">${t.highlightLinks}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="bigCursorDark" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.cursorBlack}</span>
                        <span class="acc-widget-toggle-label">${t.blackCursor}</span>
                    </button>
                </div>

                <!-- Font Size Slider -->
                <div class="acc-widget-slider-section">
                    <div class="acc-widget-slider-title">${t.fontSize}</div>
                    <div class="acc-widget-slider-row">
                        <button class="acc-widget-slider-btn" data-control="textSize" data-action="decrease" aria-label="${t.decreaseText}">
                            ${icons.minus}
                        </button>
                        <div class="acc-widget-slider-track" data-control="textSize">
                            <div class="acc-widget-slider-fill" data-control="textSize"></div>
                            <div class="acc-widget-slider-value" data-control="textSize">100%</div>
                        </div>
                        <button class="acc-widget-slider-btn" data-control="textSize" data-action="increase" aria-label="${t.increaseText}">
                            ${icons.plus}
                        </button>
                    </div>
                    <div class="acc-widget-slider-labels">
                        <span>${t.decreaseText}</span>
                        <span>${t.resetSize}</span>
                        <span>${t.increaseText}</span>
                    </div>
                </div>

                <!-- Word Spacing Slider -->
                <div class="acc-widget-slider-section">
                    <div class="acc-widget-slider-title">${t.wordSpacing}</div>
                    <div class="acc-widget-slider-row">
                        <button class="acc-widget-slider-btn" data-control="wordSpacing" data-action="decrease" aria-label="${t.decreaseSpacing}">
                            ${icons.minus}
                        </button>
                        <div class="acc-widget-slider-track" data-control="wordSpacing">
                            <div class="acc-widget-slider-fill" data-control="wordSpacing"></div>
                            <div class="acc-widget-slider-value" data-control="wordSpacing">0</div>
                        </div>
                        <button class="acc-widget-slider-btn" data-control="wordSpacing" data-action="increase" aria-label="${t.increaseSpacing}">
                            ${icons.plus}
                        </button>
                    </div>
                    <div class="acc-widget-slider-labels">
                        <span>${t.decreaseSpacing}</span>
                        <span>${t.resetSpacing}</span>
                        <span>${t.increaseSpacing}</span>
                    </div>
                </div>

                <!-- Letter Spacing Slider -->
                <div class="acc-widget-slider-section">
                    <div class="acc-widget-slider-title">${t.letterSpacing}</div>
                    <div class="acc-widget-slider-row">
                        <button class="acc-widget-slider-btn" data-control="letterSpacing" data-action="decrease" aria-label="${t.decreaseSpacing}">
                            ${icons.minus}
                        </button>
                        <div class="acc-widget-slider-track" data-control="letterSpacing">
                            <div class="acc-widget-slider-fill" data-control="letterSpacing"></div>
                            <div class="acc-widget-slider-value" data-control="letterSpacing">0</div>
                        </div>
                        <button class="acc-widget-slider-btn" data-control="letterSpacing" data-action="increase" aria-label="${t.increaseSpacing}">
                            ${icons.plus}
                        </button>
                    </div>
                    <div class="acc-widget-slider-labels">
                        <span>${t.decreaseSpacing}</span>
                        <span>${t.resetSpacing}</span>
                        <span>${t.increaseSpacing}</span>
                    </div>
                </div>

                <!-- More Toggle Buttons - 3 columns -->
                <div class="acc-widget-grid-3">
                    <button class="acc-widget-toggle" data-feature="keyboardNav" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.keyboard}</span>
                        <span class="acc-widget-toggle-label">${t.keyboardNav}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="screenMask" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.screenMask}</span>
                        <span class="acc-widget-toggle-label">${t.screenMask}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="readableFont" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.font}</span>
                        <span class="acc-widget-toggle-label">${t.readableFont}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="readingGuide" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.guide}</span>
                        <span class="acc-widget-toggle-label">${t.readingGuide}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="lineHeight" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.lineHeight}</span>
                        <span class="acc-widget-toggle-label">${t.lineHeight}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="monochrome" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.monochrome}</span>
                        <span class="acc-widget-toggle-label">${t.monochrome}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="stopAnimations" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.animation}</span>
                        <span class="acc-widget-toggle-label">${t.stopAnimations}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="highlightHeadings" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.headings}</span>
                        <span class="acc-widget-toggle-label">${t.highlightHeadings}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="magnifier" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.magnifier}</span>
                        <span class="acc-widget-toggle-label">${t.magnifier}</span>
                    </button>
                </div>

                <!-- Additional Tools - 3 columns -->
                <div class="acc-widget-grid-3">
                    <button class="acc-widget-toggle" data-feature="invertColors" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.invertColors}</span>
                        <span class="acc-widget-toggle-label">${t.invertColors}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="lowSaturation" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.lowSaturation}</span>
                        <span class="acc-widget-toggle-label">${t.lowSaturation}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="textToSpeech" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.textToSpeech}</span>
                        <span class="acc-widget-toggle-label">${t.textToSpeech}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="focusHighlight" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.focusHighlight}</span>
                        <span class="acc-widget-toggle-label">${t.focusHighlight}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="formHighlight" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.formHighlight}</span>
                        <span class="acc-widget-toggle-label">${t.formHighlight}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="hideImages" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.hideImages}</span>
                        <span class="acc-widget-toggle-label">${t.hideImages}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="underlineLinks" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.underlineLinks}</span>
                        <span class="acc-widget-toggle-label">${t.underlineLinks}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="lineMask" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.lineMask}</span>
                        <span class="acc-widget-toggle-label">${t.lineMask}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="textCursor" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.textCursor}</span>
                        <span class="acc-widget-toggle-label">${t.textCursor}</span>
                    </button>
                </div>

                <!-- Alignment & Font Tools - 3 columns -->
                <div class="acc-widget-grid-3">
                    <button class="acc-widget-toggle" data-feature="alignLeft" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.alignLeft}</span>
                        <span class="acc-widget-toggle-label">${t.alignLeft}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="alignCenter" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.alignCenter}</span>
                        <span class="acc-widget-toggle-label">${t.alignCenter}</span>
                    </button>
                    <button class="acc-widget-toggle" data-feature="alignRight" aria-pressed="false">
                        <span class="acc-widget-toggle-icon">${icons.alignRight}</span>
                        <span class="acc-widget-toggle-label">${t.alignRight}</span>
                    </button>
                </div>
                <button class="acc-widget-reset-btn" data-action="reset">
                    <span class="acc-widget-toggle-icon">${icons.reset}</span>
                    <span class="acc-widget-toggle-label">${t.reset}</span>
                </button>
            </div>
            <div class="acc-widget-footer">
                <div class="acc-widget-credit">Powered by Kfir Moscovich</div>
            </div>
        `;
        document.body.appendChild(panel);

        // Create reading guide
        const readingGuide = document.createElement('div');
        readingGuide.className = 'acc-reading-guide';
        document.body.appendChild(readingGuide);

        // Create screen mask
        const screenMask = document.createElement('div');
        screenMask.className = 'acc-screen-mask';
        screenMask.innerHTML = '<div class="acc-screen-mask-window"></div>';
        document.body.appendChild(screenMask);

        // Create line mask
        const lineMask = document.createElement('div');
        lineMask.className = 'acc-line-mask';
        document.body.appendChild(lineMask);

        // Create magnifier with zoom functionality
        const magnifier = document.createElement('div');
        magnifier.className = 'acc-magnifier';

        // Content container for zoomed view
        const magnifierContent = document.createElement('div');
        magnifierContent.className = 'acc-magnifier-content';
        magnifier.appendChild(magnifierContent);

        document.body.appendChild(magnifier);

        // Magnifier zoom level and size
        const magnifierZoom = 2;
        const magnifierSize = 200;
        let magnifierClone = null;
        let magnifierActive = false;

        function setupMagnifier() {
            // Remove old clone
            if (magnifierClone) {
                magnifierClone.remove();
            }

            // Clone body content
            magnifierClone = document.documentElement.cloneNode(true);
            magnifierClone.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: ${window.innerWidth}px;
                min-height: ${document.documentElement.scrollHeight}px;
                margin: 0;
                padding: 0;
                transform: scale(${magnifierZoom});
                transform-origin: top left;
                pointer-events: none;
                overflow: visible;
            `;

            // Remove widget elements from clone
            const removeEls = magnifierClone.querySelectorAll('.acc-widget-panel, .acc-widget-btn, .acc-widget-overlay, .acc-reading-guide, .acc-screen-mask, .acc-line-mask, .acc-magnifier');
            removeEls.forEach(el => el.remove());

            // Add clone to content container
            magnifierContent.innerHTML = '';
            magnifierContent.appendChild(magnifierClone);
        }

        // Text-to-speech functionality
        let speechSynthesis = window.speechSynthesis;
        let currentUtterance = null;

        function speakText(text) {
            if (speechSynthesis && state.textToSpeech) {
                speechSynthesis.cancel();
                currentUtterance = new SpeechSynthesisUtterance(text);
                currentUtterance.lang = lang === 'he' ? 'he-IL' : lang === 'es' ? 'es-ES' : 'en-US';
                currentUtterance.rate = 0.9;
                speechSynthesis.speak(currentUtterance);
            }
        }

        // ============================================
        // EVENT HANDLERS
        // ============================================

        function openPanel() {
            panel.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            // Update button visibility (will hide because panel is open)
            updateBtnVisibility();
            panel.querySelector('.acc-widget-close').focus();
        }

        function closePanel() {
            panel.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = '';
            // Update button visibility (will show if no menu is open)
            updateBtnVisibility();
            mainBtn.focus();
        }

        // Toggle panel
        mainBtn.addEventListener('click', openPanel);

        // Close panel
        panel.querySelector('.acc-widget-close').addEventListener('click', closePanel);
        overlay.addEventListener('click', closePanel);

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel.classList.contains('open')) {
                closePanel();
            }
        });

        // Slider controls (textSize, wordSpacing, letterSpacing)
        panel.querySelectorAll('.acc-widget-slider-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const control = btn.dataset.control;
                const action = btn.dataset.action;

                if (control === 'textSize') {
                    if (action === 'increase' && state.textSize < 5) {
                        state.textSize++;
                    } else if (action === 'decrease' && state.textSize > -3) {
                        state.textSize--;
                    }
                    updateSlider('textSize', state.textSize, '%', 100);
                    applyTextSize();
                } else if (control === 'wordSpacing') {
                    if (action === 'increase' && state.wordSpacing < 5) {
                        state.wordSpacing++;
                    } else if (action === 'decrease' && state.wordSpacing > 0) {
                        state.wordSpacing--;
                    }
                    updateSlider('wordSpacing', state.wordSpacing, '', 0);
                    applyWordSpacing();
                } else if (control === 'letterSpacing') {
                    if (action === 'increase' && state.letterSpacing < 5) {
                        state.letterSpacing++;
                    } else if (action === 'decrease' && state.letterSpacing > 0) {
                        state.letterSpacing--;
                    }
                    updateSlider('letterSpacing', state.letterSpacing, '', 0);
                    applyLetterSpacing();
                }

                saveState();
            });
        });

        function updateSlider(control, value, suffix, base) {
            const valueEl = panel.querySelector(`.acc-widget-slider-value[data-control="${control}"]`);
            const fillEl = panel.querySelector(`.acc-widget-slider-fill[data-control="${control}"]`);
            if (valueEl) {
                if (suffix === '%') {
                    valueEl.textContent = `${Math.round(base + value * 12.5)}${suffix}`;
                } else {
                    valueEl.textContent = value;
                }
            }
            if (fillEl) {
                let percentage;
                if (control === 'textSize') {
                    // Range: -3 to 5 (8 steps), center at 0 = 37.5%
                    percentage = ((value + 3) / 8) * 100;
                } else {
                    // Range: 0 to 5, so percentage is value * 20
                    percentage = (value / 5) * 100;
                }
                // Ensure minimum visible width
                fillEl.style.width = `${Math.max(percentage, 5)}%`;
            }
        }

        // Feature toggles
        panel.querySelectorAll('.acc-widget-toggle[data-feature]').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const feature = toggle.dataset.feature;
                state[feature] = !state[feature];
                toggle.classList.toggle('active', state[feature]);
                toggle.setAttribute('aria-pressed', state[feature]);
                applyFeature(feature);
                saveState();
            });
        });

        // Reset button
        panel.querySelector('.acc-widget-reset-btn').addEventListener('click', () => {
            resetAll();
            updateSlider('textSize', 0, '%', 100);
            updateSlider('wordSpacing', 0, '', 0);
            updateSlider('letterSpacing', 0, '', 0);
            panel.querySelectorAll('.acc-widget-toggle[data-feature]').forEach(opt => {
                opt.classList.remove('active');
                opt.setAttribute('aria-pressed', 'false');
            });
        });

        // Reading guide movement
        document.addEventListener('mousemove', (e) => {
            if (state.readingGuide) {
                readingGuide.style.top = `${e.clientY - 25}px`;
            }
            if (state.screenMask) {
                screenMask.querySelector('.acc-screen-mask-window').style.top = `${e.clientY - 75}px`;
            }
            if (state.lineMask) {
                lineMask.style.top = `${e.clientY - 15}px`;
            }
            if (state.magnifier && magnifierClone) {
                const x = e.pageX;
                const y = e.pageY;
                const halfLens = magnifierSize / 2;

                // Position magnifier centered on cursor
                magnifier.style.left = `${e.clientX - halfLens}px`;
                magnifier.style.top = `${e.clientY - halfLens}px`;

                // Calculate position for the zoomed clone
                // The center of the lens should show what's at the cursor position, zoomed
                const cloneX = halfLens - (x * magnifierZoom);
                const cloneY = halfLens - (y * magnifierZoom);
                magnifierClone.style.left = `${cloneX}px`;
                magnifierClone.style.top = `${cloneY}px`;
            }
        });

        // Text-to-speech on text selection
        document.addEventListener('mouseup', () => {
            if (state.textToSpeech) {
                const selection = window.getSelection().toString().trim();
                if (selection) {
                    speakText(selection);
                }
            }
        });

        // ============================================
        // APPLY FUNCTIONS
        // ============================================

        function applyTextSize() {
            // Each level adds ~2px on 16px base font (12.5% = 2/16)
            const size = 100 + state.textSize * 12.5;
            const scale = size / 100;

            // Remove old styles
            const oldStyle = document.getElementById('acc-text-size-style');
            if (oldStyle) oldStyle.remove();

            if (state.textSize !== 0) {
                // Apply font-size scaling to html element - this affects all rem-based sizes
                // And use transform scale for pixel-based elements to maintain proportions
                const style = document.createElement('style');
                style.id = 'acc-text-size-style';
                style.textContent = `
                    html {
                        font-size: ${size}% !important;
                    }
                    /* Keep accessibility widget at normal size */
                    .acc-widget-panel,
                    .acc-widget-btn,
                    .acc-widget-overlay,
                    .acc-reading-guide,
                    .acc-screen-mask,
                    .acc-line-mask,
                    .acc-magnifier {
                        font-size: 16px !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        function applyWordSpacing() {
            // Remove old word spacing style
            const oldStyle = document.getElementById('acc-word-spacing-style');
            if (oldStyle) oldStyle.remove();

            if (state.wordSpacing > 0) {
                const style = document.createElement('style');
                style.id = 'acc-word-spacing-style';
                style.textContent = `
                    body > *:not(.acc-widget-panel):not(.acc-widget-btn):not(.acc-widget-overlay):not(.acc-reading-guide):not(.acc-screen-mask):not(.acc-line-mask):not(.acc-magnifier),
                    body > *:not(.acc-widget-panel):not(.acc-widget-btn):not(.acc-widget-overlay):not(.acc-reading-guide):not(.acc-screen-mask):not(.acc-line-mask):not(.acc-magnifier) * {
                        word-spacing: ${state.wordSpacing * 0.1}em !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        function applyLetterSpacing() {
            // Remove old letter spacing style
            const oldStyle = document.getElementById('acc-letter-spacing-style');
            if (oldStyle) oldStyle.remove();

            if (state.letterSpacing > 0) {
                const style = document.createElement('style');
                style.id = 'acc-letter-spacing-style';
                style.textContent = `
                    body > *:not(.acc-widget-panel):not(.acc-widget-btn):not(.acc-widget-overlay):not(.acc-reading-guide):not(.acc-screen-mask):not(.acc-line-mask):not(.acc-magnifier),
                    body > *:not(.acc-widget-panel):not(.acc-widget-btn):not(.acc-widget-overlay):not(.acc-reading-guide):not(.acc-screen-mask):not(.acc-line-mask):not(.acc-magnifier) * {
                        letter-spacing: ${state.letterSpacing * 0.05}em !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        function applyFeature(feature) {
            const body = document.body;
            const classMap = {
                nightMode: 'acc-night-mode',
                highContrast: 'acc-high-contrast',
                lightBackground: 'acc-light-background',
                highlightLinks: 'acc-highlight-links',
                readableFont: 'acc-readable-font',
                stopAnimations: 'acc-stop-animations',
                bigCursorLight: 'acc-big-cursor-light',
                bigCursorDark: 'acc-big-cursor-dark',
                keyboardNav: 'acc-keyboard-nav',
                highlightHeadings: 'acc-highlight-headings',
                lineHeight: 'acc-line-height',
                monochrome: 'acc-monochrome',
                // New features
                invertColors: 'acc-invert-colors',
                lowSaturation: 'acc-low-saturation',
                focusHighlight: 'acc-focus-highlight',
                formHighlight: 'acc-form-highlight',
                hideImages: 'acc-hide-images',
                underlineLinks: 'acc-underline-links',
                textCursor: 'acc-text-cursor',
                alignCenter: 'acc-align-center',
                alignLeft: 'acc-align-left',
                alignRight: 'acc-align-right'
            };

            if (feature === 'readingGuide') {
                readingGuide.classList.toggle('active', state.readingGuide);
            } else if (feature === 'screenMask') {
                screenMask.classList.toggle('active', state.screenMask);
            } else if (feature === 'lineMask') {
                lineMask.classList.toggle('active', state.lineMask);
            } else if (feature === 'magnifier') {
                magnifier.classList.toggle('active', state.magnifier);
                body.classList.toggle('acc-magnifier-active', state.magnifier);

                if (state.magnifier) {
                    // Setup magnifier with cloned content
                    setupMagnifier();
                    magnifierActive = true;
                } else {
                    // Clean up
                    magnifierActive = false;
                    if (magnifierClone) {
                        magnifierClone.remove();
                        magnifierClone = null;
                    }
                    magnifierContent.innerHTML = '';
                }
            } else if (feature === 'textToSpeech') {
                if (!state.textToSpeech && speechSynthesis) {
                    speechSynthesis.cancel();
                }
            } else if (classMap[feature]) {
                body.classList.toggle(classMap[feature], state[feature]);
            }

            // Handle alignment conflicts
            if (feature === 'alignLeft' && state.alignLeft) {
                state.alignCenter = false;
                state.alignRight = false;
                body.classList.remove('acc-align-center', 'acc-align-right');
                panel.querySelector('[data-feature="alignCenter"]')?.classList.remove('active');
                panel.querySelector('[data-feature="alignRight"]')?.classList.remove('active');
            } else if (feature === 'alignCenter' && state.alignCenter) {
                state.alignLeft = false;
                state.alignRight = false;
                body.classList.remove('acc-align-left', 'acc-align-right');
                panel.querySelector('[data-feature="alignLeft"]')?.classList.remove('active');
                panel.querySelector('[data-feature="alignRight"]')?.classList.remove('active');
            } else if (feature === 'alignRight' && state.alignRight) {
                state.alignLeft = false;
                state.alignCenter = false;
                body.classList.remove('acc-align-left', 'acc-align-center');
                panel.querySelector('[data-feature="alignLeft"]')?.classList.remove('active');
                panel.querySelector('[data-feature="alignCenter"]')?.classList.remove('active');
            }
        }

        function resetAll() {
            state = {
                textSize: 0,
                wordSpacing: 0,
                letterSpacing: 0,
                nightMode: false,
                highContrast: false,
                lightBackground: false,
                highlightLinks: false,
                readableFont: false,
                readingGuide: false,
                stopAnimations: false,
                bigCursorLight: false,
                bigCursorDark: false,
                keyboardNav: false,
                screenMask: false,
                highlightHeadings: false,
                lineHeight: false,
                monochrome: false,
                // New features
                magnifier: false,
                invertColors: false,
                lowSaturation: false,
                textToSpeech: false,
                focusHighlight: false,
                formHighlight: false,
                hideImages: false,
                underlineLinks: false,
                lineMask: false,
                textCursor: false,
                alignCenter: false,
                alignLeft: false,
                alignRight: false
            };

            document.body.classList.remove(
                'acc-night-mode',
                'acc-high-contrast',
                'acc-light-background',
                'acc-highlight-links',
                'acc-readable-font',
                'acc-stop-animations',
                'acc-big-cursor-light',
                'acc-big-cursor-dark',
                'acc-keyboard-nav',
                'acc-highlight-headings',
                'acc-line-height',
                'acc-monochrome',
                // New classes
                'acc-invert-colors',
                'acc-low-saturation',
                'acc-focus-highlight',
                'acc-form-highlight',
                'acc-hide-images',
                'acc-underline-links',
                'acc-text-cursor',
                'acc-align-center',
                'acc-align-left',
                'acc-align-right',
                'acc-magnifier-active'
            );

            // Remove text size style
            const textSizeStyle = document.getElementById('acc-text-size-style');
            if (textSizeStyle) textSizeStyle.remove();

            // Remove word spacing style
            const wordSpacingStyle = document.getElementById('acc-word-spacing-style');
            if (wordSpacingStyle) wordSpacingStyle.remove();

            // Remove letter spacing style
            const letterSpacingStyle = document.getElementById('acc-letter-spacing-style');
            if (letterSpacingStyle) letterSpacingStyle.remove();

            readingGuide.classList.remove('active');
            screenMask.classList.remove('active');
            lineMask.classList.remove('active');
            magnifier.classList.remove('active');

            // Stop text-to-speech
            if (speechSynthesis) {
                speechSynthesis.cancel();
            }

            saveState();
        }

        // Apply saved state on load
        function applyStoredState() {
            applyTextSize();
            applyWordSpacing();
            applyLetterSpacing();
            updateSlider('textSize', state.textSize, '%', 100);
            updateSlider('wordSpacing', state.wordSpacing, '', 0);
            updateSlider('letterSpacing', state.letterSpacing, '', 0);

            Object.keys(state).forEach(feature => {
                if (!['textSize', 'wordSpacing', 'letterSpacing'].includes(feature) && state[feature]) {
                    applyFeature(feature);
                    const toggle = panel.querySelector(`[data-feature="${feature}"]`);
                    if (toggle) {
                        toggle.classList.add('active');
                        toggle.setAttribute('aria-pressed', 'true');
                    }
                }
            });
        }

        // Initialize
        loadState();
        applyStoredState();
    }

    // ============================================
    // INITIALIZE
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
})();
