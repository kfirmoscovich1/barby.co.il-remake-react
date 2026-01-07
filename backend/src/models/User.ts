import mongoose, { Schema, Document } from 'mongoose';
import type { UserRole } from '../types/index.js';

export interface UserDocument extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'editor'] as UserRole[],
            default: 'editor',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc: Document, ret: Record<string, unknown>) => {
                ret.id = String(ret._id);
                delete ret._id;
                delete ret.__v;
                delete ret.passwordHash;
                return ret;
            },
        },
    }
);

userSchema.index({ email: 1 });

export const User = mongoose.model<UserDocument>('User', userSchema);
