import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User, RefreshToken, AuditLog } from '../models/index.js';
import type { LoginResponse, UserPublic } from '../types/index.js';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function generateAccessToken(user: { id: string; email: string; role: string }): string {
    const options: SignOptions = { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] };
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        options
    );
}

export function generateRefreshToken(user: { id: string; email: string; role: string }): string {
    const options: SignOptions = { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] };
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwt.refreshSecret,
        options
    );
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new Error('אימייל או סיסמה שגויים');
    }

    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
        throw new Error('אימייל או סיסמה שגויים');
    }

    const accessToken = generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt,
    });

    // Audit log
    await AuditLog.create({
        actorUserId: user._id,
        actorEmail: user.email,
        action: 'login',
        entityType: 'user',
        entityId: user._id.toString(),
    });

    const userPublic: UserPublic = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as 'admin' | 'editor',
        createdAt: user.createdAt,
    };

    return {
        accessToken,
        refreshToken,
        user: userPublic,
    };
}

export async function refresh(refreshTokenStr: string): Promise<{ accessToken: string }> {
    // Verify token signature
    let payload: { userId: string; email: string; role: string };
    try {
        payload = jwt.verify(refreshTokenStr, config.jwt.refreshSecret) as typeof payload;
    } catch {
        throw new Error('טוקן לא תקין');
    }

    // Check if token exists in database
    const storedToken = await RefreshToken.findOne({ token: refreshTokenStr });
    if (!storedToken) {
        throw new Error('טוקן לא נמצא');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
        await RefreshToken.deleteOne({ _id: storedToken._id });
        throw new Error('טוקן פג תוקף');
    }

    // Get user
    const user = await User.findById(payload.userId);
    if (!user) {
        throw new Error('משתמש לא נמצא');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
    });

    return { accessToken };
}

export async function logout(refreshTokenStr: string): Promise<void> {
    await RefreshToken.deleteOne({ token: refreshTokenStr });
}

export async function createUser(
    email: string,
    password: string,
    role: 'admin' | 'editor',
    createdById?: string
): Promise<UserPublic> {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new Error('משתמש עם אימייל זה כבר קיים');
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
        email: email.toLowerCase(),
        passwordHash,
        role,
    });

    if (createdById) {
        const actor = await User.findById(createdById);
        if (actor) {
            await AuditLog.create({
                actorUserId: createdById,
                actorEmail: actor.email,
                action: 'create',
                entityType: 'user',
                entityId: user._id.toString(),
                diffSummary: `Created user: ${email} with role: ${role}`,
            });
        }
    }

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as 'admin' | 'editor',
        createdAt: user.createdAt,
    };
}

export async function changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('משתמש לא נמצא');
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
        throw new Error('הסיסמה הנוכחית שגויה');
    }

    // Validate new password
    if (newPassword.length < 8) {
        throw new Error('הסיסמה החדשה חייבת להכיל לפחות 8 תווים');
    }

    // Hash and save new password
    const passwordHash = await hashPassword(newPassword);
    user.passwordHash = passwordHash;
    await user.save();

    // Audit log
    await AuditLog.create({
        actorUserId: userId,
        actorEmail: user.email,
        action: 'update',
        entityType: 'user',
        entityId: userId,
        diffSummary: 'Password changed',
    });
}
