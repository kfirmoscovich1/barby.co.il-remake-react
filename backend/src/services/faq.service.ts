import mongoose from 'mongoose';
import { FAQ, AuditLog, User } from '../models/index.js';
import type { FAQItem } from '../types/index.js';

export interface CreateFAQInput {
    question: string;
    answer: string;
    category?: string;
    order?: number;
    isActive?: boolean;
}

export interface UpdateFAQInput extends Partial<CreateFAQInput> { }

// Get all active FAQs (public)
export async function getActiveFAQs(): Promise<FAQItem[]> {
    const faqs = await FAQ.find({ isActive: true })
        .sort({ category: 1, order: 1 })
        .lean();

    return faqs.map(faq => ({
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'כללי',
        order: faq.order,
        isActive: faq.isActive,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
    }));
}

// Get all FAQs (admin)
export async function getAllFAQs(): Promise<FAQItem[]> {
    const faqs = await FAQ.find()
        .sort({ category: 1, order: 1 })
        .lean();

    return faqs.map(faq => ({
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'כללי',
        order: faq.order,
        isActive: faq.isActive,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
    }));
}

// Get FAQ by ID
export async function getFAQById(id: string): Promise<FAQItem | null> {
    const faq = await FAQ.findById(id).lean();
    if (!faq) return null;

    return {
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'כללי',
        order: faq.order,
        isActive: faq.isActive,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
    };
}

// Create FAQ
export async function createFAQ(data: CreateFAQInput, userId: string): Promise<FAQItem> {
    // Get max order for the category
    const maxOrder = await FAQ.findOne({ category: data.category || 'כללי' })
        .sort({ order: -1 })
        .select('order')
        .lean();

    const faq = await FAQ.create({
        ...data,
        order: data.order ?? ((maxOrder?.order ?? -1) + 1),
    });

    // Log audit
    const user = await User.findById(userId);
    if (user) {
        await AuditLog.create({
            actorUserId: userId,
            actorEmail: user.email,
            action: 'create',
            entityType: 'faq',
            entityId: faq._id.toString(),
            diffSummary: `Created FAQ: ${data.question.substring(0, 50)}`,
        });
    }

    return {
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'כללי',
        order: faq.order,
        isActive: faq.isActive,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
    };
}

// Update FAQ
export async function updateFAQ(id: string, data: UpdateFAQInput, userId: string): Promise<FAQItem | null> {
    const faq = await FAQ.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
    ).lean();

    if (!faq) return null;

    // Log audit
    const user = await User.findById(userId);
    if (user) {
        await AuditLog.create({
            actorUserId: userId,
            actorEmail: user.email,
            action: 'update',
            entityType: 'faq',
            entityId: id,
            diffSummary: `Updated FAQ: ${faq.question.substring(0, 50)}`,
        });
    }

    return {
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'כללי',
        order: faq.order,
        isActive: faq.isActive,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
    };
}

// Delete FAQ
export async function deleteFAQ(id: string, userId: string): Promise<boolean> {
    const faq = await FAQ.findById(id);
    if (!faq) return false;

    await faq.deleteOne();

    // Log audit
    const user = await User.findById(userId);
    if (user) {
        await AuditLog.create({
            actorUserId: userId,
            actorEmail: user.email,
            action: 'delete',
            entityType: 'faq',
            entityId: id,
            diffSummary: `Deleted FAQ: ${faq.question.substring(0, 50)}`,
        });
    }

    return true;
}

// Reorder FAQs
export async function reorderFAQs(ids: string[], userId: string): Promise<void> {
    const bulkOps = ids.map((id, index) => ({
        updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(id) },
            update: { $set: { order: index } },
        },
    }));

    await FAQ.bulkWrite(bulkOps);

    // Log audit
    const user = await User.findById(userId);
    if (user) {
        await AuditLog.create({
            actorUserId: userId,
            actorEmail: user.email,
            action: 'update',
            entityType: 'faq',
            diffSummary: `Reordered ${ids.length} FAQs`,
        });
    }
}

// Get unique categories
export async function getFAQCategories(): Promise<string[]> {
    const categories = await FAQ.distinct('category');
    return categories.filter(Boolean).sort();
}
