import mongoose, { Schema, Document, Types } from 'mongoose';
import type { PageKey } from '../types/index.js';

export interface PageDocument extends Document {
    key: PageKey;
    title: string;
    contentRichText: string;
    pdfMediaId?: Types.ObjectId;
    updatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const pageSchema = new Schema<PageDocument>(
    {
        key: {
            type: String,
            enum: ['about', 'terms', 'accessibility', 'privacy', 'contact', 'mailing-list'] as PageKey[],
            required: true,
            unique: true,
        },
        title: { type: String, required: true },
        contentRichText: { type: String, required: true },
        pdfMediaId: { type: Schema.Types.ObjectId, ref: 'Media' },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

export const Page = mongoose.model<PageDocument>('Page', pageSchema);
