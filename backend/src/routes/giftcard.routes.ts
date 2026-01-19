import { Router } from 'express';
import { z } from 'zod';
import { validateBody, authenticate, type AuthRequest } from '../middleware/index.js';
import * as giftCardService from '../services/giftcard.service.js';
import * as userService from '../services/user.service.js';

const router = Router();

// Schema for creating a gift card
const createGiftCardSchema = z.object({
    amount: z.number().min(100, 'סכום מינימלי 100₪').max(5000, 'סכום מקסימלי 5000₪'),
    recipientEmail: z.string().email('כתובת אימייל לא תקינה'),
    recipientName: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
    recipientPhone: z.string().optional(),
    isForSelf: z.boolean(),
    message: z.string().max(500).optional(),
});

// Schema for using a gift card
const useGiftCardSchema = z.object({
    code: z.string().min(1, 'קוד גיפטקארד חובה'),
    amount: z.number().min(1, 'סכום חייב להיות לפחות 1'),
    orderId: z.string().optional(),
    description: z.string().optional(),
});

// Schema for validating a gift card
const validateGiftCardSchema = z.object({
    code: z.string().min(1, 'קוד גיפטקארד חובה'),
});

// POST /api/giftcards - Create a new gift card (requires authentication)
router.post(
    '/',
    authenticate,
    validateBody(createGiftCardSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const user = await userService.getUserById(req.userId!);
            if (!user) {
                return res.status(401).json({ success: false, error: 'משתמש לא נמצא' });
            }

            const { amount, recipientEmail, recipientName, recipientPhone, isForSelf, message } = req.body;

            const giftCard = await giftCardService.createGiftCard({
                amount,
                purchaserId: req.userId!,
                purchaserEmail: user.email,
                purchaserName: user.name,
                recipientEmail: isForSelf ? user.email : recipientEmail,
                recipientName: isForSelf ? user.name : recipientName,
                recipientPhone,
                isForSelf,
                message,
            });

            res.status(201).json({ success: true, data: giftCard });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/giftcards/my - Get my gift cards (received)
router.get('/my', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const user = await userService.getUserById(req.userId!);
        if (!user) {
            return res.status(401).json({ success: false, error: 'משתמש לא נמצא' });
        }

        const giftCards = await giftCardService.getGiftCardsReceivedByEmail(user.email);
        res.json({ success: true, data: giftCards });
    } catch (error) {
        next(error);
    }
});

// GET /api/giftcards/purchased - Get gift cards I purchased
router.get('/purchased', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const giftCards = await giftCardService.getGiftCardsPurchasedByUser(req.userId!);
        res.json({ success: true, data: giftCards });
    } catch (error) {
        next(error);
    }
});

// GET /api/giftcards/:code - Get gift card by code
router.get('/:code', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const giftCard = await giftCardService.getGiftCardByCode(req.params.code);
        if (!giftCard) {
            return res.status(404).json({ success: false, error: 'גיפטקארד לא נמצא' });
        }

        // Only allow viewing if user is recipient or purchaser
        const user = await userService.getUserById(req.userId!);
        if (!user) {
            return res.status(401).json({ success: false, error: 'משתמש לא נמצא' });
        }

        if (giftCard.recipientEmail !== user.email && giftCard.purchaserEmail !== user.email) {
            return res.status(403).json({ success: false, error: 'אין הרשאה לצפייה בגיפטקארד זה' });
        }

        res.json({ success: true, data: giftCard });
    } catch (error) {
        next(error);
    }
});

// POST /api/giftcards/validate - Validate a gift card code
router.post(
    '/validate',
    authenticate,
    validateBody(validateGiftCardSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const { code } = req.body;
            const result = await giftCardService.validateGiftCard(code);

            if (!result.valid) {
                return res.status(400).json({
                    success: false,
                    error: result.error,
                    data: result.giftCard ? { balance: result.giftCard.balance, status: result.giftCard.status } : null,
                });
            }

            res.json({
                success: true,
                data: {
                    code: result.giftCard!.code,
                    balance: result.giftCard!.balance,
                    status: result.giftCard!.status,
                    expiresAt: result.giftCard!.expiresAt,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/giftcards/use - Use gift card balance
router.post(
    '/use',
    authenticate,
    validateBody(useGiftCardSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const { code, amount, orderId, description } = req.body;
            const giftCard = await giftCardService.useGiftCard(code, amount, orderId, description);
            res.json({ success: true, data: giftCard });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ success: false, error: error.message });
            }
            next(error);
        }
    }
);

export default router;
