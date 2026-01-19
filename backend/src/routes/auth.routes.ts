import { Router } from 'express';
import { loginSchema, refreshTokenSchema } from '../validation/index.js';
import { validateBody, authenticate, type AuthRequest } from '../middleware/index.js';
import * as authService from '../services/auth.service.js';
import * as userService from '../services/user.service.js';

const router = Router();

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ success: false, error: error.message });
        } else {
            next(error);
        }
    }
});

// POST /api/auth/refresh
router.post('/refresh', validateBody(refreshTokenSchema), async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refresh(refreshToken);
        res.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ success: false, error: error.message });
        } else {
            next(error);
        }
    }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await authService.logout(refreshToken);
        }
        res.json({ success: true, message: 'התנתקת בהצלחה' });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const user = await userService.getUserById(req.userId!);
        if (!user) {
            return res.status(404).json({ success: false, error: 'משתמש לא נמצא' });
        }
        res.json({ success: true, data: { user } });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/change-password - Change user password
router.post('/change-password', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'חסרים פרטים' });
        }

        await authService.changePassword(req.userId!, currentPassword, newPassword);
        res.json({ success: true, message: 'הסיסמה שונתה בהצלחה' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            next(error);
        }
    }
});

export default router;
