import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema, ZodIssue } from 'zod';

export function validateBody(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((e: ZodIssue) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                res.status(400).json({
                    success: false,
                    error: 'שגיאת אימות נתונים',
                    details: errors,
                });
                return;
            }
            next(error);
        }
    };
}

export function validateQuery(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.query = schema.parse(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((e: ZodIssue) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                res.status(400).json({
                    success: false,
                    error: 'שגיאת פרמטרים',
                    details: errors,
                });
                return;
            }
            next(error);
        }
    };
}

export function validateParams(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.params = schema.parse(req.params);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((e: ZodIssue) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                res.status(400).json({
                    success: false,
                    error: 'פרמטרים לא תקינים',
                    details: errors,
                });
                return;
            }
            next(error);
        }
    };
}
