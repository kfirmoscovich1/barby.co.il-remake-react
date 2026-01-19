import express, { type Request, type Response, type NextFunction } from 'express';
import { authenticate, authorize, type AuthRequest } from '../middleware/index.js';
import * as orderService from '../services/order.service.js';

const router = express.Router();

/**
 * POST /api/orders
 * Create a new order (authenticated users)
 */
router.post(
    '/',
    authenticate,
    async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user!;
            const {
                showId,
                tickets,
                userPhone,
                userIdNumber,
                giftCardCode,
                giftCardAmountUsed
            } = req.body;

            // Validate required fields
            if (!showId || !tickets || !Array.isArray(tickets) || tickets.length === 0) {
                res.status(400).json({ error: 'חסרים פרטי הזמנה' });
                return;
            }

            // Validate tickets structure
            for (const ticket of tickets) {
                if (!ticket.tierLabel || typeof ticket.tierPrice !== 'number' || typeof ticket.quantity !== 'number') {
                    res.status(400).json({ error: 'מבנה כרטיסים לא תקין' });
                    return;
                }
            }

            const order = await orderService.createOrder({
                userId: user._id.toString(),
                userEmail: user.email,
                userName: user.name || '',
                userPhone: userPhone || '',
                userIdNumber: userIdNumber || '',
                showId,
                tickets,
                giftCardCode,
                giftCardAmountUsed,
            });

            res.status(201).json(order);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/orders/my
 * Get current user's orders
 */
router.get(
    '/my',
    authenticate,
    async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!._id.toString();
            const orders = await orderService.getOrdersByUserId(userId);
            res.json(orders);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/orders/by-number/:orderNumber
 * Get order by order number
 */
router.get(
    '/by-number/:orderNumber',
    authenticate,
    async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { orderNumber } = req.params;
            const order = await orderService.getOrderByNumber(orderNumber);

            if (!order) {
                res.status(404).json({ error: 'ההזמנה לא נמצאה' });
                return;
            }

            // Check ownership (unless admin)
            if (order.userId.toString() !== req.user!._id.toString()) {
                res.status(403).json({ error: 'אין הרשאה לצפייה בהזמנה זו' });
                return;
            }

            res.json(order);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/orders/:id
 * Get order by ID (owner or admin)
 */
router.get(
    '/:id',
    authenticate,
    async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const order = await orderService.getOrderById(id);

            if (!order) {
                res.status(404).json({ error: 'ההזמנה לא נמצאה' });
                return;
            }

            // Check ownership
            if (order.userId.toString() !== req.user!._id.toString()) {
                res.status(403).json({ error: 'אין הרשאה לצפייה בהזמנה זו' });
                return;
            }

            res.json(order);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/orders/:id/cancel
 * Cancel an order
 */
router.post(
    '/:id/cancel',
    authenticate,
    async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const order = await orderService.getOrderById(id);

            if (!order) {
                res.status(404).json({ error: 'ההזמנה לא נמצאה' });
                return;
            }

            // Check ownership
            if (order.userId.toString() !== req.user!._id.toString()) {
                res.status(403).json({ error: 'אין הרשאה לביטול הזמנה זו' });
                return;
            }

            const cancelledOrder = await orderService.cancelOrder(id);
            res.json(cancelledOrder);
        } catch (error) {
            next(error);
        }
    }
);

// ================ Admin Routes ================

/**
 * GET /api/orders/admin/all
 * Get all orders with pagination (admin)
 */
router.get(
    '/admin/all',
    authenticate,
    authorize('admin'),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { page = '1', limit = '20', status, userId, showId } = req.query;
            const result = await orderService.getAllOrders({
                page: parseInt(page as string, 10),
                limit: parseInt(limit as string, 10),
                status: status as string,
                userId: userId as string,
                showId: showId as string,
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/orders/admin/stats
 * Get order statistics (admin)
 */
router.get(
    '/admin/stats',
    authenticate,
    authorize('admin'),
    async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const stats = await orderService.getOrderStats();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/orders/admin/show/:showId
 * Get all orders for a show (admin)
 */
router.get(
    '/admin/show/:showId',
    authenticate,
    authorize('admin'),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { showId } = req.params;
            const orders = await orderService.getOrdersByShowId(showId);
            res.json(orders);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
