import mongoose, { Schema, Document, Types } from 'mongoose';
import type { ShowStatus, TicketTier } from '../types/index.js';

export interface ShowDocument extends Document {
    title: string;
    slug?: string;
    dateISO: string;
    doorsTime?: string;
    description: string;
    imageMediaId?: string; // Can be ObjectId string or external URL
    status: ShowStatus;
    isStanding?: boolean;
    is360?: boolean;
    venueName: string;
    venueAddress: string;
    ticketTiers: TicketTier[];
    tags: string[];
    featured: boolean;
    published: boolean;
    archived: boolean;
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ticketTierSchema = new Schema<TicketTier>(
    {
        label: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'ILS' },
    },
    { _id: false }
);

const showSchema = new Schema<ShowDocument>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, trim: true, unique: true, sparse: true },
        dateISO: { type: String, required: true },
        doorsTime: { type: String },
        description: { type: String, required: true },
        imageMediaId: { type: String }, // Can be ObjectId string or external URL
        status: {
            type: String,
            enum: ['available', 'sold_out', 'closed', 'few_left'] as ShowStatus[],
            default: 'available',
        },
        isStanding: { type: Boolean },
        is360: { type: Boolean },
        venueName: { type: String, required: true },
        venueAddress: { type: String, required: true },
        ticketTiers: { type: [ticketTierSchema], required: true },
        tags: { type: [String], default: [] },
        featured: { type: Boolean, default: false },
        published: { type: Boolean, default: false },
        archived: { type: Boolean, default: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc: Document, ret: Record<string, unknown>) => {
                ret.id = String(ret._id);
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

showSchema.index({ dateISO: 1 });
showSchema.index({ status: 1 });
showSchema.index({ featured: 1 });
showSchema.index({ archived: 1 });
showSchema.index({ published: 1 });
showSchema.index({ title: 'text', description: 'text' });
// Compound indexes for common query patterns
showSchema.index({ archived: 1, published: 1, dateISO: 1 }); // Main shows list query
showSchema.index({ featured: 1, published: 1, archived: 1, dateISO: 1 }); // Featured shows query
showSchema.index({ slug: 1 }); // Lookup by slug

// Auto-generate slug from title if not provided
showSchema.pre('save', function (this: ShowDocument, next: () => void) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\u0590-\u05FF]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

export const Show = mongoose.model<ShowDocument>('Show', showSchema);
