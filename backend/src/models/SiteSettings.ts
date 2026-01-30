import mongoose, { Schema, Document } from 'mongoose';
import type {
    SiteSettings as SiteSettingsType,
    ChandelierConfig,
    NavLink,
    FooterContent,
    Announcement,
    FeaturedSection
} from '../types/index.js';

export interface SiteSettingsDocument extends Omit<SiteSettingsType, 'updatedAt' | 'updatedBy'>, Document {
    updatedBy: mongoose.Types.ObjectId;
}

const chandelierConfigSchema = new Schema<ChandelierConfig>(
    {
        enabled: { type: Boolean, default: true },
        imageMediaId: { type: Schema.Types.ObjectId, ref: 'Media' },
        altText: { type: String, default: 'נברשת בארבי' },
        placement: { type: String, enum: ['hero', 'banner', 'floating'], default: 'hero' },
        desktopSize: { type: String, enum: ['small', 'medium', 'large'], default: 'large' },
        mobileSize: { type: String, enum: ['compact', 'hidden'], default: 'compact' },
        ariaHidden: { type: Boolean, default: true },
    },
    { _id: false }
);

const navLinkSchema = new Schema<NavLink>(
    {
        label: { type: String, required: true },
        href: { type: String, required: true },
        external: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const footerContentSchema = new Schema<FooterContent>(
    {
        address: { type: String, default: '' },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },
        socialLinks: [{
            platform: String,
            url: String,
        }],
        copyrightText: { type: String, default: '© Barby' },
    },
    { _id: false }
);

const announcementSchema = new Schema<Announcement>(
    {
        id: { type: String, required: true },
        text: { type: String, required: true },
        enabled: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const featuredSectionSchema = new Schema<FeaturedSection>(
    {
        id: { type: String, required: true },
        title: { type: String, required: true },
        type: { type: String, enum: ['shows', 'custom'], default: 'shows' },
        showIds: [{ type: Schema.Types.ObjectId, ref: 'Show' }],
        enabled: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const siteSettingsSchema = new Schema<SiteSettingsDocument>(
    {
        chandelier: { type: chandelierConfigSchema, default: () => ({}) },
        announcements: { type: [announcementSchema], default: [] },
        marqueeItems: { type: [String], default: [] },
        featuredSections: { type: [featuredSectionSchema], default: [] },
        navLinks: { type: [navLinkSchema], default: [] },
        footer: { type: footerContentSchema, default: () => ({}) },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc: Document, ret: Record<string, unknown>) => {
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

export const SiteSettings = mongoose.model<SiteSettingsDocument>('SiteSettings', siteSettingsSchema);
