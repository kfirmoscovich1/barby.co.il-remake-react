import { AuditLog } from '../models/index.js';
import type { AuditLog as AuditLogType, PaginatedResponse } from '../types/index.js';

export async function getAuditLogs(params: {
    page?: number;
    limit?: number;
    entityType?: string;
    action?: string;
    userId?: string;
}): Promise<PaginatedResponse<AuditLogType>> {
    const { page = 1, limit = 50, entityType, action, userId } = params;

    const query: Record<string, unknown> = {};

    if (entityType) query.entityType = entityType;
    if (action) query.action = action;
    if (userId) query.actorUserId = userId;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        AuditLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        AuditLog.countDocuments(query),
    ]);

    return {
        items: logs.map((log) => ({
            id: log._id.toString(),
            actorUserId: log.actorUserId.toString(),
            actorEmail: log.actorEmail,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            diffSummary: log.diffSummary,
            createdAt: log.createdAt,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
