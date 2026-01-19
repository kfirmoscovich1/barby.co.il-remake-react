import mongoose, { Schema, Document } from 'mongoose';
import type { FAQItem } from '../types/index.js';

export interface FAQDocument extends Omit<FAQItem, 'id'>, Document { }

const faqSchema = new Schema<FAQDocument>(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        category: { type: String, default: 'כללי' },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc: Document, ret: Record<string, unknown>) => {
                ret.id = ret._id?.toString();
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Index for ordering
faqSchema.index({ order: 1 });
faqSchema.index({ category: 1, order: 1 });

export const FAQ = mongoose.model<FAQDocument>('FAQ', faqSchema);
