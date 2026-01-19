import mongoose, { Schema, Document } from 'mongoose';

export type GiftCardStatus = 'active' | 'redeemed' | 'expired' | 'partially_used';

export interface GiftCardDocument extends Document {
    code: string;
    amount: number;
    balance: number;
    currency: string;
    status: GiftCardStatus;
    purchaserId: mongoose.Types.ObjectId;
    purchaserEmail: string;
    purchaserName: string;
    recipientEmail: string;
    recipientName: string;
    recipientPhone?: string;
    isForSelf: boolean;
    message?: string;
    purchasedAt: Date;
    expiresAt: Date;
    redeemedAt?: Date;
    usageHistory: {
        date: Date;
        amount: number;
        orderId?: string;
        description: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

// Generate unique gift card code
function generateGiftCardCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = [];
    for (let i = 0; i < 4; i++) {
        let segment = '';
        for (let j = 0; j < 4; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        segments.push(segment);
    }
    return segments.join('-');
}

const giftCardSchema = new Schema<GiftCardDocument>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            default: generateGiftCardCode,
        },
        amount: {
            type: Number,
            required: true,
            min: 100,
            max: 5000,
        },
        balance: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: 'ILS',
        },
        status: {
            type: String,
            enum: ['active', 'redeemed', 'expired', 'partially_used'] as GiftCardStatus[],
            default: 'active',
        },
        purchaserId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        purchaserEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        purchaserName: {
            type: String,
            required: true,
            trim: true,
        },
        recipientEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        recipientName: {
            type: String,
            required: true,
            trim: true,
        },
        recipientPhone: {
            type: String,
            trim: true,
        },
        isForSelf: {
            type: Boolean,
            default: false,
        },
        message: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        purchasedAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        redeemedAt: {
            type: Date,
        },
        usageHistory: [{
            date: { type: Date, default: Date.now },
            amount: { type: Number, required: true },
            orderId: { type: String },
            description: { type: String, required: true },
        }],
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc: Document, ret: Record<string, unknown>) => {
                ret.id = String(ret._id);
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Indexes
giftCardSchema.index({ code: 1 }, { unique: true });
giftCardSchema.index({ purchaserEmail: 1 });
giftCardSchema.index({ recipientEmail: 1 });
giftCardSchema.index({ purchaserId: 1 });
giftCardSchema.index({ status: 1 });
giftCardSchema.index({ expiresAt: 1 });

// Virtual for computed status
giftCardSchema.virtual('computedStatus').get(function () {
    if (this.status === 'redeemed') return 'redeemed';
    if (new Date() > this.expiresAt) return 'expired';
    if (this.balance === 0) return 'redeemed';
    if (this.balance < this.amount) return 'partially_used';
    return 'active';
});

// Pre-save middleware to set expiration date (5 years from purchase)
giftCardSchema.pre('save', function (next) {
    if (this.isNew && !this.expiresAt) {
        const expirationDate = new Date(this.purchasedAt || new Date());
        expirationDate.setFullYear(expirationDate.getFullYear() + 5);
        this.expiresAt = expirationDate;
    }
    next();
});

// Method to use gift card
giftCardSchema.methods.use = async function (amount: number, orderId?: string, description?: string) {
    if (this.status === 'redeemed' || this.status === 'expired') {
        throw new Error('Gift card is not active');
    }
    if (new Date() > this.expiresAt) {
        this.status = 'expired';
        await this.save();
        throw new Error('Gift card has expired');
    }
    if (amount > this.balance) {
        throw new Error('Insufficient balance');
    }

    this.balance -= amount;
    this.usageHistory.push({
        date: new Date(),
        amount,
        orderId,
        description: description || 'שימוש בגיפטקארד',
    });

    if (this.balance === 0) {
        this.status = 'redeemed';
        this.redeemedAt = new Date();
    } else {
        this.status = 'partially_used';
    }

    await this.save();
    return this;
};

export const GiftCard = mongoose.model<GiftCardDocument>('GiftCard', giftCardSchema);
