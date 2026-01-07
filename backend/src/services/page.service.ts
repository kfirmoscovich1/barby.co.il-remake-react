import { Page, AuditLog, User, Media } from '../models/index.js';
import type { Page as PageType, PageKey } from '../types/index.js';
import type { UpdatePageInput } from '../validation/index.js';

export async function getPageByKey(key: PageKey): Promise<(PageType & { pdfUrl?: string }) | null> {
    const page = await Page.findOne({ key }).lean();
    if (!page) return null;

    let pdfUrl: string | undefined;
    if (page.pdfMediaId) {
        pdfUrl = `/api/media/${page.pdfMediaId.toString()}`;
    }

    return {
        key: page.key as PageKey,
        title: page.title,
        contentRichText: page.contentRichText,
        pdfMediaId: page.pdfMediaId?.toString(),
        pdfUrl,
        updatedAt: page.updatedAt,
        updatedBy: page.updatedBy.toString(),
    };
}

export async function getAllPages(): Promise<PageType[]> {
    const pages = await Page.find().lean();

    return pages.map((page) => ({
        key: page.key as PageKey,
        title: page.title,
        contentRichText: page.contentRichText,
        pdfMediaId: page.pdfMediaId?.toString(),
        updatedAt: page.updatedAt,
        updatedBy: page.updatedBy.toString(),
    }));
}

export async function updatePage(
    key: PageKey,
    data: UpdatePageInput,
    userId: string
): Promise<PageType | null> {
    const page = await Page.findOneAndUpdate(
        { key },
        {
            ...data,
            pdfMediaId: data.pdfMediaId || undefined,
            updatedBy: userId,
        },
        { new: true, upsert: true }
    );

    const user = await User.findById(userId);
    if (user) {
        await AuditLog.create({
            actorUserId: userId,
            actorEmail: user.email,
            action: 'update',
            entityType: 'page',
            entityId: key,
            diffSummary: `Updated page: ${key}`,
        });
    }

    return {
        key: page.key as PageKey,
        title: page.title,
        contentRichText: page.contentRichText,
        pdfMediaId: page.pdfMediaId?.toString(),
        updatedAt: page.updatedAt,
        updatedBy: page.updatedBy.toString(),
    };
}
