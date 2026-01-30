import { GiftCard, type GiftCardDocument } from '../models/GiftCard.js';
import mongoose from 'mongoose';

export interface CreateGiftCardData {
    amount: number;
    purchaserId: string;
    purchaserEmail: string;
    purchaserName: string;
    recipientEmail: string;
    recipientName: string;
    recipientPhone?: string;
    isForSelf: boolean;
    message?: string;
}

export interface GiftCardFilters {
    email?: string;
    status?: string;
    page?: number;
    limit?: number;
}

/**
 * Create a new gift card
 */
export async function createGiftCard(data: CreateGiftCardData): Promise<GiftCardDocument> {
    const purchasedAt = new Date();
    const expiresAt = new Date(purchasedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 5);

    const giftCard = new GiftCard({
        amount: data.amount,
        balance: data.amount,
        purchaserId: new mongoose.Types.ObjectId(data.purchaserId),
        purchaserEmail: data.purchaserEmail,
        purchaserName: data.purchaserName,
        recipientEmail: data.recipientEmail,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        isForSelf: data.isForSelf,
        message: data.message,
        purchasedAt,
        expiresAt,
        status: 'active',
    });

    await giftCard.save();
    return giftCard;
}

/**
 * Get gift card by code
 */
export async function getGiftCardByCode(code: string): Promise<GiftCardDocument | null> {
    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });
    if (giftCard) {
        // Update status if expired
        if (new Date() > giftCard.expiresAt && giftCard.status === 'active') {
            giftCard.status = 'expired';
            await giftCard.save();
        }
    }
    return giftCard;
}

/**
 * Get gift card by ID
 */
export async function getGiftCardById(id: string): Promise<GiftCardDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }
    const giftCard = await GiftCard.findById(id);
    if (giftCard) {
        // Update status if expired
        if (new Date() > giftCard.expiresAt && giftCard.status === 'active') {
            giftCard.status = 'expired';
            await giftCard.save();
        }
    }
    return giftCard;
}

/**
 * Get gift cards for a user (by email - either purchased or received)
 */
export async function getGiftCardsByEmail(email: string): Promise<GiftCardDocument[]> {
    const giftCards = await GiftCard.find({
        $or: [
            { purchaserEmail: email.toLowerCase() },
            { recipientEmail: email.toLowerCase() },
        ],
    }).sort({ purchasedAt: -1 });

    // Update expired statuses
    for (const gc of giftCards) {
        if (new Date() > gc.expiresAt && gc.status === 'active') {
            gc.status = 'expired';
            await gc.save();
        }
    }

    return giftCards;
}

/**
 * Get gift cards purchased by a user
 */
export async function getGiftCardsPurchasedByUser(userId: string): Promise<GiftCardDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return [];
    }
    const giftCards = await GiftCard.find({
        purchaserId: new mongoose.Types.ObjectId(userId),
    }).sort({ purchasedAt: -1 });

    // Update expired statuses
    for (const gc of giftCards) {
        if (new Date() > gc.expiresAt && gc.status === 'active') {
            gc.status = 'expired';
            await gc.save();
        }
    }

    return giftCards;
}

/**
 * Get gift cards received by email (for user's "my gift cards" section)
 */
export async function getGiftCardsReceivedByEmail(email: string): Promise<GiftCardDocument[]> {
    const giftCards = await GiftCard.find({
        recipientEmail: email.toLowerCase(),
    }).sort({ purchasedAt: -1 });

    // Update expired statuses
    for (const gc of giftCards) {
        if (new Date() > gc.expiresAt && gc.status === 'active') {
            gc.status = 'expired';
            await gc.save();
        }
    }

    return giftCards;
}

/**
 * Use gift card balance
 */
export async function useGiftCard(
    code: string,
    amount: number,
    orderId?: string,
    description?: string
): Promise<GiftCardDocument> {
    const giftCard = await getGiftCardByCode(code);
    if (!giftCard) {
        throw new Error('גיפטקארד לא נמצא');
    }
    if (giftCard.status === 'redeemed') {
        throw new Error('הגיפטקארד כבר מומש במלואו');
    }
    if (giftCard.status === 'expired' || new Date() > giftCard.expiresAt) {
        throw new Error('הגיפטקארד פג תוקף');
    }
    if (amount > giftCard.balance) {
        throw new Error(`יתרה לא מספיקה. יתרה נוכחית: ₪${giftCard.balance}`);
    }

    giftCard.balance -= amount;
    giftCard.usageHistory.push({
        date: new Date(),
        amount,
        orderId,
        description: description || 'שימוש בגיפטקארד',
    });

    if (giftCard.balance === 0) {
        giftCard.status = 'redeemed';
        giftCard.redeemedAt = new Date();
    } else {
        giftCard.status = 'partially_used';
    }

    await giftCard.save();
    return giftCard;
}

/**
 * Validate gift card for use
 */
export async function validateGiftCard(code: string): Promise<{
    valid: boolean;
    giftCard?: GiftCardDocument;
    error?: string;
}> {
    const giftCard = await getGiftCardByCode(code);

    if (!giftCard) {
        return { valid: false, error: 'גיפטקארד לא נמצא' };
    }
    if (giftCard.status === 'redeemed') {
        return { valid: false, error: 'הגיפטקארד כבר מומש במלואו', giftCard };
    }
    if (giftCard.status === 'expired' || new Date() > giftCard.expiresAt) {
        return { valid: false, error: 'הגיפטקארד פג תוקף', giftCard };
    }
    if (giftCard.balance <= 0) {
        return { valid: false, error: 'אין יתרה בגיפטקארד', giftCard };
    }

    return { valid: true, giftCard };
}

/**
 * Get all gift cards with pagination (admin)
 */
export async function getAllGiftCards(filters: GiftCardFilters = {}) {
    const { page = 1, limit = 20, status, email } = filters;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (status) {
        query.status = status;
    }

    if (email) {
        query.$or = [
            { purchaserEmail: email.toLowerCase() },
            { recipientEmail: email.toLowerCase() },
        ];
    }

    const [items, total] = await Promise.all([
        GiftCard.find(query)
            .sort({ purchasedAt: -1 })
            .skip(skip)
            .limit(limit),
        GiftCard.countDocuments(query),
    ]);

    // Update expired statuses
    for (const gc of items) {
        if (new Date() > gc.expiresAt && gc.status === 'active') {
            gc.status = 'expired';
            await gc.save();
        }
    }

    return {
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
    };
}

/**
 * Get gift card statistics (admin)
 */
export async function getGiftCardStats() {
    const now = new Date();

    const [
        totalCount,
        activeCount,
        redeemedCount,
        expiredCount,
        totalValue,
        activeBalance,
    ] = await Promise.all([
        GiftCard.countDocuments(),
        GiftCard.countDocuments({ status: 'active', expiresAt: { $gt: now } }),
        GiftCard.countDocuments({ status: 'redeemed' }),
        GiftCard.countDocuments({
            $or: [
                { status: 'expired' },
                { status: 'active', expiresAt: { $lte: now } },
            ],
        }),
        GiftCard.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        GiftCard.aggregate([
            { $match: { status: { $in: ['active', 'partially_used'] }, expiresAt: { $gt: now } } },
            { $group: { _id: null, total: { $sum: '$balance' } } },
        ]),
    ]);

    return {
        totalCount,
        activeCount,
        redeemedCount,
        expiredCount,
        partiallyUsedCount: await GiftCard.countDocuments({ status: 'partially_used' }),
        totalValue: totalValue[0]?.total || 0,
        activeBalance: activeBalance[0]?.total || 0,
    };
}
