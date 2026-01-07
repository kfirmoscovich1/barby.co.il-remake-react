import { User, AuditLog } from '../models/index.js';
import { hashPassword } from './auth.service.js';
import type { UserPublic, PaginatedResponse } from '../types/index.js';
import type { UpdateUserInput } from '../validation/index.js';

export async function getUsers(params: {
    page?: number;
    limit?: number;
}): Promise<PaginatedResponse<UserPublic>> {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find()
            .select('-passwordHash')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(),
    ]);

    return {
        items: users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role as 'admin' | 'editor',
            createdAt: user.createdAt,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getUserById(id: string): Promise<UserPublic | null> {
    const user = await User.findById(id).select('-passwordHash').lean();
    if (!user) return null;

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as 'admin' | 'editor',
        createdAt: user.createdAt,
    };
}

export async function updateUser(
    id: string,
    data: UpdateUserInput,
    actorId: string
): Promise<UserPublic | null> {
    const updateData: Record<string, unknown> = {};

    if (data.email) {
        updateData.email = data.email.toLowerCase();
    }

    if (data.password) {
        updateData.passwordHash = await hashPassword(data.password);
    }

    if (data.role) {
        updateData.role = data.role;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true })
        .select('-passwordHash')
        .lean();

    if (!user) return null;

    const actor = await User.findById(actorId);
    if (actor) {
        await AuditLog.create({
            actorUserId: actorId,
            actorEmail: actor.email,
            action: 'update',
            entityType: 'user',
            entityId: id,
            diffSummary: `Updated user: ${user.email}`,
        });
    }

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as 'admin' | 'editor',
        createdAt: user.createdAt,
    };
}

export async function deleteUser(id: string, actorId: string): Promise<boolean> {
    // Prevent self-deletion
    if (id === actorId) {
        throw new Error('לא ניתן למחוק את המשתמש שלך');
    }

    const user = await User.findById(id);
    if (!user) return false;

    await User.deleteOne({ _id: id });

    const actor = await User.findById(actorId);
    if (actor) {
        await AuditLog.create({
            actorUserId: actorId,
            actorEmail: actor.email,
            action: 'delete',
            entityType: 'user',
            entityId: id,
            diffSummary: `Deleted user: ${user.email}`,
        });
    }

    return true;
}
