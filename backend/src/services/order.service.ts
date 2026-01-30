import { Order, type OrderDocument } from '../models/Order.js';
import { Show } from '../models/Show.js';
import mongoose from 'mongoose';

export interface CreateOrderData {
    userId: string;
    userEmail: string;
    userName: string;
    userPhone: string;
    userIdNumber: string;
    showId: string;
    tickets: {
        tierLabel: string;
        tierPrice: number;
        quantity: number;
    }[];
    giftCardCode?: string;
    giftCardAmountUsed?: number;
}

export interface OrderFilters {
    userId?: string;
    showId?: string;
    status?: string;
    page?: number;
    limit?: number;
}

/**
 * Create a new order
 */
export async function createOrder(data: CreateOrderData): Promise<OrderDocument> {
    // Validate show exists
    const show = await Show.findById(data.showId);
    if (!show) {
        throw new Error('ההופעה לא נמצאה');
    }

    // Calculate tickets with subtotals
    const ticketsWithSubtotals = data.tickets.map(ticket => ({
        ...ticket,
        subtotal: ticket.tierPrice * ticket.quantity,
    }));

    // Calculate total
    const totalAmount = ticketsWithSubtotals.reduce((sum, t) => sum + t.subtotal, 0);

    const order = new Order({
        userId: new mongoose.Types.ObjectId(data.userId),
        userEmail: data.userEmail,
        userName: data.userName,
        userPhone: data.userPhone,
        userIdNumber: data.userIdNumber,
        showId: new mongoose.Types.ObjectId(data.showId),
        showTitle: show.title,
        showDate: new Date(show.dateISO),
        showVenue: show.venueName,
        tickets: ticketsWithSubtotals,
        totalAmount,
        status: 'confirmed',
        paymentStatus: 'paid',
        giftCardCode: data.giftCardCode,
        giftCardAmountUsed: data.giftCardAmountUsed,
    });

    await order.save();
    return order;
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string): Promise<OrderDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }
    return Order.findById(id);
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<OrderDocument | null> {
    return Order.findOne({ orderNumber });
}

/**
 * Get orders for a user
 */
export async function getOrdersByUserId(userId: string): Promise<OrderDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return [];
    }
    return Order.find({
        userId: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });
}

/**
 * Get orders by email
 */
export async function getOrdersByEmail(email: string): Promise<OrderDocument[]> {
    return Order.find({
        userEmail: email.toLowerCase(),
    }).sort({ createdAt: -1 });
}

/**
 * Get orders for a show
 */
export async function getOrdersByShowId(showId: string): Promise<OrderDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(showId)) {
        return [];
    }
    return Order.find({
        showId: new mongoose.Types.ObjectId(showId),
    }).sort({ createdAt: -1 });
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string): Promise<OrderDocument | null> {
    const order = await getOrderById(orderId);
    if (!order) {
        throw new Error('ההזמנה לא נמצאה');
    }
    if (order.status === 'cancelled') {
        throw new Error('ההזמנה כבר בוטלה');
    }
    if (order.status === 'refunded') {
        throw new Error('ההזמנה כבר קיבלה החזר');
    }

    order.status = 'cancelled';
    await order.save();
    return order;
}

/**
 * Get all orders with pagination (admin)
 */
export async function getAllOrders(filters: OrderFilters = {}) {
    const { page = 1, limit = 20, status, userId, showId } = filters;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (status) {
        query.status = status;
    }
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        query.userId = new mongoose.Types.ObjectId(userId);
    }
    if (showId && mongoose.Types.ObjectId.isValid(showId)) {
        query.showId = new mongoose.Types.ObjectId(showId);
    }

    const [items, total] = await Promise.all([
        Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Order.countDocuments(query),
    ]);

    return {
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
    };
}

/**
 * Get order statistics (admin)
 */
export async function getOrderStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
        totalCount,
        confirmedCount,
        cancelledCount,
        todayCount,
        monthCount,
        totalRevenue,
        todayRevenue,
        monthRevenue,
    ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'confirmed' }),
        Order.countDocuments({ status: 'cancelled' }),
        Order.countDocuments({ createdAt: { $gte: startOfDay } }),
        Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Order.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.aggregate([
            { $match: { status: 'confirmed', createdAt: { $gte: startOfDay } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.aggregate([
            { $match: { status: 'confirmed', createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
    ]);

    return {
        totalCount,
        confirmedCount,
        cancelledCount,
        refundedCount: await Order.countDocuments({ status: 'refunded' }),
        todayCount,
        monthCount,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
    };
}

/**
 * Get ticket count for a show
 */
export async function getShowTicketCount(showId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(showId)) {
        return 0;
    }
    const result = await Order.aggregate([
        { $match: { showId: new mongoose.Types.ObjectId(showId), status: 'confirmed' } },
        { $unwind: '$tickets' },
        { $group: { _id: null, total: { $sum: '$tickets.quantity' } } },
    ]);
    return result[0]?.total || 0;
}
