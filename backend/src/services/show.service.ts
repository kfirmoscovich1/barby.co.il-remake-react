import { Show, AuditLog, User } from '../models/index.js';
import type { Show as ShowType, ShowListItem, PaginatedResponse, ShowsQueryParams } from '../types/index.js';
import type { CreateShowInput, UpdateShowInput } from '../validation/index.js';

// Cache for auto-archive to prevent running on every request
let lastAutoArchiveRun = 0;
const AUTO_ARCHIVE_INTERVAL = 1000 * 60 * 60; // Run at most once per hour

// Auto-archive shows with past dates (yesterday and before)
export async function autoArchivePastShows(): Promise<number> {
    const now = Date.now();
    
    // Skip if we ran recently (within the last hour)
    if (now - lastAutoArchiveRun < AUTO_ARCHIVE_INTERVAL) {
        return 0;
    }
    
    lastAutoArchiveRun = now;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString(); // Full ISO string for start of today

    const result = await Show.updateMany(
        {
            archived: false,
            dateISO: { $lt: todayISO, $ne: '' },
        },
        {
            $set: { archived: true, updatedAt: new Date() },
        }
    );

    return result.modifiedCount;
}

// In-memory cache for shows list (short-lived)
interface ShowsCache {
    data: PaginatedResponse<ShowListItem>;
    timestamp: number;
    key: string;
}
let showsCache: ShowsCache | null = null;
const SHOWS_CACHE_TTL = 1000 * 30; // 30 seconds cache

export async function getShows(
    params: ShowsQueryParams,
    includeUnpublished = false
): Promise<PaginatedResponse<ShowListItem>> {
    // Auto-archive past shows (throttled to once per hour)
    autoArchivePastShows().catch(console.error); // Fire and forget

    const {
        page = 1,
        limit = 12,
        search,
        status,
        featured,
        archived = false,
        startDate,
        endDate,
        tags,
    } = params;

    // Generate cache key for this specific query
    const cacheKey = JSON.stringify({ page, limit, search, status, featured, archived, startDate, endDate, tags, includeUnpublished });
    
    // Check cache (only for public, non-search queries)
    if (!search && !includeUnpublished && showsCache && showsCache.key === cacheKey) {
        if (Date.now() - showsCache.timestamp < SHOWS_CACHE_TTL) {
            return showsCache.data;
        }
    }

    const query: Record<string, unknown> = { archived };

    if (!includeUnpublished) {
        query.published = true;
    }

    if (search) {
        query.$text = { $search: search };
    }

    if (status) {
        query.status = status;
    }

    if (featured !== undefined) {
        query.featured = featured;
    }

    if (startDate || endDate) {
        query.dateISO = {};
        if (startDate) {
            (query.dateISO as Record<string, string>).$gte = startDate;
        }
        if (endDate) {
            (query.dateISO as Record<string, string>).$lte = endDate;
        }
    }

    if (tags && tags.length > 0) {
        query.tags = { $in: tags };
    }

    const skip = (page - 1) * limit;

    const [shows, total] = await Promise.all([
        Show.find(query)
            .sort({ dateISO: archived ? -1 : 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Show.countDocuments(query),
    ]);

    const items: ShowListItem[] = shows.map((show) => ({
        id: show._id.toString(),
        title: show.title,
        slug: show.slug,
        dateISO: show.dateISO,
        doorsTime: show.doorsTime,
        description: show.description,
        imageMediaId: show.imageMediaId,
        status: show.status,
        isStanding: show.isStanding,
        is360: show.is360,
        venueName: show.venueName,
        ticketTiers: show.ticketTiers,
        featured: show.featured,
        archived: show.archived,
    }));

    const result = {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    // Update cache for public queries
    if (!search && !includeUnpublished) {
        showsCache = {
            data: result,
            timestamp: Date.now(),
            key: cacheKey,
        };
    }

    return result;
}

export async function getShowById(id: string): Promise<ShowType | null> {
    const show = await Show.findById(id).lean();

    if (!show) return null;

    return {
        id: show._id.toString(),
        title: show.title,
        slug: show.slug,
        dateISO: show.dateISO,
        doorsTime: show.doorsTime,
        description: show.description,
        imageMediaId: show.imageMediaId,
        status: show.status,
        isStanding: show.isStanding,
        is360: show.is360,
        venueName: show.venueName,
        venueAddress: show.venueAddress,
        ticketTiers: show.ticketTiers,
        tags: show.tags,
        featured: show.featured,
        published: show.published,
        archived: show.archived,
        createdAt: show.createdAt,
        updatedAt: show.updatedAt,
        createdBy: show.createdBy.toString(),
        updatedBy: show.updatedBy.toString(),
    };
}

export async function getShowBySlug(slug: string): Promise<ShowType | null> {
    const show = await Show.findOne({ slug }).lean();

    if (!show) return null;

    return {
        id: show._id.toString(),
        title: show.title,
        slug: show.slug,
        dateISO: show.dateISO,
        doorsTime: show.doorsTime,
        description: show.description,
        imageMediaId: show.imageMediaId,
        status: show.status,
        isStanding: show.isStanding,
        is360: show.is360,
        venueName: show.venueName,
        venueAddress: show.venueAddress,
        ticketTiers: show.ticketTiers,
        tags: show.tags,
        featured: show.featured,
        published: show.published,
        archived: show.archived,
        createdAt: show.createdAt,
        updatedAt: show.updatedAt,
        createdBy: show.createdBy.toString(),
        updatedBy: show.updatedBy.toString(),
    };
}

export async function createShow(data: CreateShowInput, userId: string): Promise<ShowType> {
    const show = await Show.create({
        ...data,
        createdBy: userId,
        updatedBy: userId,
    });

    const user = await User.findById(userId);
    if (user) {
        await AuditLog.create({
            actorUserId: userId,
            actorEmail: user.email,
            action: 'create',
            entityType: 'show',
            entityId: show._id.toString(),
            diffSummary: `Created show: ${show.title}`,
        });
    }

    return getShowById(show._id.toString()) as Promise<ShowType>;
}

export async function updateShow(
    id: string,
    data: UpdateShowInput,
    userId: string
): Promise<ShowType | null> {
    const show = await Show.findByIdAndUpdate(
        id,
        { ...data, updatedBy: userId },
        { new: true }
    );

    if (!show) return null;

    const user = await User.findById(userId);
    if (user) {
        await AuditLog.create({
            actorUserId: userId,
            actorEmail: user.email,
            action: 'update',
            entityType: 'show',
            entityId: show._id.toString(),
            diffSummary: `Updated show: ${show.title}`,
        });
    }

    return getShowById(show._id.toString());
}

export async function deleteShow(id: string, userId: string): Promise<boolean> {
    const show = await Show.findById(id);
    if (!show) return false;

    await Show.deleteOne({ _id: id });

    const user = await User.findById(userId);
    if (user) {
        await AuditLog.create({
            actorUserId: userId,
            actorEmail: user.email,
            action: 'delete',
            entityType: 'show',
            entityId: id,
            diffSummary: `Deleted show: ${show.title}`,
        });
    }

    return true;
}

export async function getFeaturedShows(limit = 6): Promise<ShowListItem[]> {
    const shows = await Show.find({
        featured: true,
        published: true,
        archived: false,
        dateISO: { $gte: new Date().toISOString() },
    })
        .sort({ dateISO: 1 })
        .limit(limit)
        .lean();

    return shows.map((show) => ({
        id: show._id.toString(),
        title: show.title,
        slug: show.slug,
        dateISO: show.dateISO,
        doorsTime: show.doorsTime,
        description: show.description,
        imageMediaId: show.imageMediaId,
        status: show.status,
        isStanding: show.isStanding,
        is360: show.is360,
        venueName: show.venueName,
        ticketTiers: show.ticketTiers,
        featured: show.featured,
        archived: show.archived,
    }));
}

export async function getUpcomingShows(limit = 12): Promise<ShowListItem[]> {
    const shows = await Show.find({
        published: true,
        archived: false,
        dateISO: { $gte: new Date().toISOString() },
    })
        .sort({ dateISO: 1 })
        .limit(limit)
        .lean();

    return shows.map((show) => ({
        id: show._id.toString(),
        title: show.title,
        slug: show.slug,
        dateISO: show.dateISO,
        doorsTime: show.doorsTime,
        description: show.description,
        imageMediaId: show.imageMediaId,
        status: show.status,
        isStanding: show.isStanding,
        is360: show.is360,
        venueName: show.venueName,
        ticketTiers: show.ticketTiers,
        featured: show.featured,
        archived: show.archived,
    }));
}
