import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export function errorHandler(
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'שגיאת שרת פנימית';

    // Log error in development
    if (config.nodeEnv === 'development') {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            statusCode,
        });
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
}

export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: `הנתיב ${req.originalUrl} לא נמצא`,
    });
}

export function createError(message: string, statusCode: number): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}
