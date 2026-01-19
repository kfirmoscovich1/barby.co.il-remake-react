import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderTicket {
    tierLabel: string;
    tierPrice: number;
    quantity: number;
    subtotal: number;
}

export interface OrderDocument extends Document {
    orderNumber: string;
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    userName: string;
    userPhone: string;
    userIdNumber: string;
    showId: mongoose.Types.ObjectId;
    showTitle: string;
    showDate: Date;
    showVenue: string;
    tickets: OrderTicket[];
    totalAmount: number;
    currency: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: string;
    giftCardCode?: string;
    giftCardAmountUsed?: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Generate unique order number
function generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}${random}`;
}

const orderTicketSchema = new Schema<OrderTicket>(
    {
        tierLabel: { type: String, required: true },
        tierPrice: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true },
    },
    { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            default: generateOrderNumber,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        userName: {
            type: String,
            required: true,
            trim: true,
        },
        userPhone: {
            type: String,
            required: true,
            trim: true,
        },
        userIdNumber: {
            type: String,
            required: true,
            trim: true,
        },
        showId: {
            type: Schema.Types.ObjectId,
            ref: 'Show',
            required: true,
        },
        showTitle: {
            type: String,
            required: true,
        },
        showDate: {
            type: Date,
            required: true,
        },
        showVenue: {
            type: String,
            required: true,
        },
        tickets: {
            type: [orderTicketSchema],
            required: true,
            validate: {
                validator: (v: OrderTicket[]) => v.length > 0,
                message: 'יש לבחור לפחות כרטיס אחד',
            },
        },
        totalAmount: {
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
            enum: ['pending', 'confirmed', 'cancelled', 'refunded'] as OrderStatus[],
            default: 'confirmed',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'] as PaymentStatus[],
            default: 'paid',
        },
        paymentMethod: {
            type: String,
            default: 'credit_card',
        },
        giftCardCode: {
            type: String,
        },
        giftCardAmountUsed: {
            type: Number,
        },
        notes: {
            type: String,
        },
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
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ userId: 1 });
orderSchema.index({ userEmail: 1 });
orderSchema.index({ showId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for total ticket count
orderSchema.virtual('totalTickets').get(function () {
    return this.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
});

export const Order = mongoose.model<OrderDocument>('Order', orderSchema);
