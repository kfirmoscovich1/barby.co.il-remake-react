import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User, UserDocument } from '../models/index.js';
import type { UserRole } from '../types/index.js';

export interface AuthRequest extends Request {
    user?: UserDocument;
    userId?: string;
}

interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}

export async function authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, error: 'אסימון הזדהות חסר' });
            return;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401).json({ success: false, error: 'משתמש לא נמצא' });
            return;
        }

        req.user = user;
        req.userId = user._id.toString();
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ success: false, error: 'אסימון הזדהות פג תוקף' });
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ success: false, error: 'אסימון הזדהות לא תקין' });
            return;
        }
        next(error);
    }
}

export function authorize(...roles: UserRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'לא מורשה' });
            return;
        }

        if (!roles.includes(req.user.role as UserRole)) {
            res.status(403).json({ success: false, error: 'אין הרשאה לפעולה זו' });
            return;
        }

        next();
    };
}
