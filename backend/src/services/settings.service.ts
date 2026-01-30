import { SiteSettings, AuditLog, User } from '../models/index.js';
import type { SiteSettings as SiteSettingsType } from '../types/index.js';
import type { UpdateSiteSettingsInput } from '../validation/index.js';

// In-memory cache for site settings (rarely changes)
let settingsCache: { data: SiteSettingsType; timestamp: number } | null = null;
const SETTINGS_CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

// Function to clear cache (called after updates)
export function clearSettingsCache(): void {
    settingsCache = null;
}

const DEFAULT_SETTINGS: Omit<SiteSettingsType, 'updatedAt' | 'updatedBy'> = {
    chandelier: {
        enabled: true,
        altText: 'נברשת בארבי',
        placement: 'hero',
        desktopSize: 'large',
        mobileSize: 'compact',
        ariaHidden: true,
    },
    announcements: [],
    marqueeItems: [
        '** לידיעתכם **',
        'כשרשום באתר: אזלו הכרטיסים, אז גם בקופה אזלו הכרטיסים!',
        '** זיכויים יתבצעו ע"פ חוק ישראל המצוטט בתקנון **',
        'את הכרטיס ניתן למצוא גם בחשבון שלי באתר שלנו',
        '** השעה מציינת את שעת פתיחת הדלתות **',
        'המופעים מתחילים שעה עד שעה וחצי אחרי השעה המצוינת!',
        '** שימו לב **',
        'רכישת כרטיסים להופעות בבארבי מתבצעת רק באתר הרשמי שלנו ולא באתרים מחו"ל',
    ],
    featuredSections: [
        {
            id: 'upcoming',
            title: 'הופעות קרובות',
            type: 'shows',
            enabled: true,
            order: 0,
        },
    ],
    navLinks: [
        { label: 'עמוד הבית', href: '/', external: false, order: 0 },
        { label: 'הופעות', href: '/shows', external: false, order: 1 },
        { label: 'ארכיון', href: '/archive', external: false, order: 2 },
        { label: 'גיפט קארד', href: '/gift-card', external: false, order: 3 },
        { label: 'צור קשר', href: '/contact', external: false, order: 4 },
    ],
    footer: {
        address: 'קיבוץ גלויות 52, תל אביב',
        phone: '03-5188123',
        email: 'info@barby.co.il',
        socialLinks: [
            { platform: 'facebook', url: 'https://facebook.com/barbytlv' },
            { platform: 'instagram', url: 'https://instagram.com/barbytlv' },
        ],
        copyrightText: '© Barby - כל הזכויות שמורות',
    },
};

export async function getSiteSettings(): Promise<SiteSettingsType> {
    // Check cache first
    if (settingsCache && Date.now() - settingsCache.timestamp < SETTINGS_CACHE_TTL) {
        return settingsCache.data;
    }

    let settings = await SiteSettings.findOne().lean();

    let result: SiteSettingsType;
    if (!settings) {
        // Return default settings if none exist
        result = {
            ...DEFAULT_SETTINGS,
            updatedAt: new Date(),
            updatedBy: '',
        };
    } else {
        result = {
            chandelier: settings.chandelier || DEFAULT_SETTINGS.chandelier,
            announcements: settings.announcements || [],
            marqueeItems: settings.marqueeItems || DEFAULT_SETTINGS.marqueeItems,
            featuredSections: settings.featuredSections || DEFAULT_SETTINGS.featuredSections,
            navLinks: settings.navLinks || DEFAULT_SETTINGS.navLinks,
            footer: settings.footer || DEFAULT_SETTINGS.footer,
            updatedAt: (settings as { updatedAt?: Date }).updatedAt || new Date(),
            updatedBy: settings.updatedBy?.toString() || '',
        };
    }

    // Update cache
    settingsCache = { data: result, timestamp: Date.now() };

    return result;
}

export async function updateSiteSettings(
    data: UpdateSiteSettingsInput,
    userId: string
): Promise<SiteSettingsType> {
    let settings = await SiteSettings.findOne();

    if (!settings) {
        settings = new SiteSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            updatedBy: userId,
        });
    } else {
        if (data.chandelier) settings.chandelier = { ...settings.chandelier, ...data.chandelier };
        if (data.announcements) settings.announcements = data.announcements;
        if (data.marqueeItems !== undefined) settings.marqueeItems = data.marqueeItems;
        if (data.featuredSections) settings.featuredSections = data.featuredSections;
        if (data.navLinks) settings.navLinks = data.navLinks;
        if (data.footer) settings.footer = { ...settings.footer, ...data.footer };
        settings.updatedBy = userId as unknown as typeof settings.updatedBy;
    }

    await settings.save();

    // Clear cache after update
    clearSettingsCache();

    const user = await User.findById(userId);
    if (user) {
        await AuditLog.create({
            actorUserId: userId,
            actorEmail: user.email,
            action: 'update',
            entityType: 'site-settings',
            diffSummary: 'Updated site settings',
        });
    }

    return getSiteSettings();
}

export async function initializeSiteSettings(userId: string): Promise<void> {
    const existing = await SiteSettings.findOne();
    if (!existing) {
        await SiteSettings.create({
            ...DEFAULT_SETTINGS,
            updatedBy: userId,
        });
    }
}
