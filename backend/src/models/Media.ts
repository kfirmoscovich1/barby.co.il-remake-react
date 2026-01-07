import mongoose, { Schema, Document, Types } from 'mongoose';
import type { MediaVariant } from '../types/index.js';

export interface MediaDocument extends Document {
    originalName: string;
    contentType: string;
    width: number;
    height: number;
    sizeBytes: number;
    dataBase64: string;
    variants: MediaVariant[];
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const mediaVariantSchema = new Schema<MediaVariant>(
    {
        name: { type: String, required: true },
        contentType: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        sizeBytes: { type: Number, required: true },
        dataBase64: { type: String, required: true },
    },
    { _id: false }
);

const mediaSchema = new Schema<MediaDocument>(
    {
        originalName: { type: String, required: true },
        contentType: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        sizeBytes: { type: Number, required: true },
        dataBase64: { type: String, required: true },
        variants: { type: [mediaVariantSchema], default: [] },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc: Document, ret: Record<string, unknown>) => {
                ret.id = String(ret._id);
                delete ret._id;
                delete ret.__v;
                // Don't include base64 data in list responses
                delete ret.dataBase64;
                delete ret.variants;
                return ret;
            },
        },
    }
);

mediaSchema.index({ originalName: 'text' });
mediaSchema.index({ contentType: 1 });
mediaSchema.index({ createdAt: -1 });

export const Media = mongoose.model<MediaDocument>('Media', mediaSchema);
