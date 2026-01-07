import mongoose, { Schema, Document, Types } from 'mongoose';
import type { AuditAction, AuditEntityType } from '../types/index.js';

export interface AuditLogDocument extends Document {
    actorUserId: Types.ObjectId;
    actorEmail: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string;
    diffSummary?: string;
    createdAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
    {
        actorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        actorEmail: { type: String, required: true },
        action: {
            type: String,
            enum: ['create', 'update', 'delete', 'login', 'logout'] as AuditAction[],
            required: true,
        },
        entityType: {
            type: String,
            enum: ['user', 'show', 'page', 'media', 'site-settings'] as AuditEntityType[],
            required: true,
        },
        entityId: { type: String },
        diffSummary: { type: String },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
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

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorUserId: 1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ action: 1 });

export const AuditLog = mongoose.model<AuditLogDocument>('AuditLog', auditLogSchema);
