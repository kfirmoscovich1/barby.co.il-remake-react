import sharp from 'sharp';
import { Media, AuditLog, User } from '../models/index.js';
import { config } from '../config/index.js';
import type { Media as MediaType, MediaListItem, PaginatedResponse } from '../types/index.js';

interface ProcessedImage {
    buffer: Buffer;
    contentType: string;
    width: number;
    height: number;
}

export async function processImage(
    buffer: Buffer,
    contentType: string
): Promise<{ main: ProcessedImage; thumbnail: ProcessedImage }> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // Resize main image if too large
    let mainBuffer = buffer;
    let mainWidth = width;
    let mainHeight = height;

    if (width > config.image.maxWidth || height > config.image.maxHeight) {
        const resized = await image
            .resize(config.image.maxWidth, config.image.maxHeight, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({ quality: config.image.quality })
            .toBuffer({ resolveWithObject: true });

        mainBuffer = resized.data;
        mainWidth = resized.info.width;
        mainHeight = resized.info.height;
    }

    // Create thumbnail
    const thumbnail = await sharp(buffer)
        .resize(config.image.thumbnailWidth, config.image.thumbnailHeight, {
            fit: 'cover',
        })
        .jpeg({ quality: 70 })
        .toBuffer({ resolveWithObject: true });

    return {
        main: {
            buffer: mainBuffer,
            contentType: 'image/jpeg',
            width: mainWidth,
            height: mainHeight,
        },
        thumbnail: {
            buffer: thumbnail.data,
            contentType: 'image/jpeg',
            width: thumbnail.info.width,
            height: thumbnail.info.height,
        },
    };
}

export async function uploadMedia(
    file: Express.Multer.File,
    userId: string
): Promise<MediaType> {
    let dataBase64: string;
    let width: number;
    let height: number;
    let contentType: string;
    let variants: MediaType['variants'] = [];

    // Process images
    if (file.mimetype.startsWith('image/')) {
        const processed = await processImage(file.buffer, file.mimetype);

        dataBase64 = processed.main.buffer.toString('base64');
        width = processed.main.width;
        height = processed.main.height;
        contentType = processed.main.contentType;

        // Add thumbnail variant
        variants = [
            {
                name: 'thumb',
                contentType: processed.thumbnail.contentType,
                width: processed.thumbnail.width,
                height: processed.thumbnail.height,
                sizeBytes: processed.thumbnail.buffer.length,
                dataBase64: processed.thumbnail.buffer.toString('base64'),
            },
        ];
    } else {
        // For non-images (PDF), just store as-is
        dataBase64 = file.buffer.toString('base64');
        width = 0;
        height = 0;
        contentType = file.mimetype;
    }

    const media = await Media.create({
        originalName: file.originalname,
        contentType,
        width,
        height,
        sizeBytes: file.buffer.length,
        dataBase64,
        variants,
        createdBy: userId,
    });

    const user = await User.findById(userId);
    if (user) {
        await AuditLog.create({
            actorUserId: userId,
            actorEmail: user.email,
            action: 'create',
            entityType: 'media',
            entityId: media._id.toString(),
            diffSummary: `Uploaded: ${file.originalname}`,
        });
    }

    return {
        id: media._id.toString(),
        originalName: media.originalName,
        contentType: media.contentType,
        width: media.width,
        height: media.height,
        sizeBytes: media.sizeBytes,
        dataBase64: media.dataBase64,
        variants: media.variants,
        createdAt: media.createdAt,
        createdBy: media.createdBy.toString(),
    };
}

export async function getMediaList(params: {
    page?: number;
    limit?: number;
    search?: string;
    contentType?: string;
}): Promise<PaginatedResponse<MediaListItem>> {
    const { page = 1, limit = 20, search, contentType } = params;

    const query: Record<string, unknown> = {};

    if (search) {
        query.$text = { $search: search };
    }

    if (contentType) {
        query.contentType = { $regex: contentType, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Media.find(query)
            .select('-dataBase64 -variants')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Media.countDocuments(query),
    ]);

    return {
        items: items.map((item) => ({
            id: item._id.toString(),
            originalName: item.originalName,
            contentType: item.contentType,
            width: item.width,
            height: item.height,
            sizeBytes: item.sizeBytes,
            createdAt: item.createdAt,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getMediaById(id: string): Promise<MediaType | null> {
    const media = await Media.findById(id).lean();
    if (!media) return null;

    return {
        id: media._id.toString(),
        originalName: media.originalName,
        contentType: media.contentType,
        width: media.width,
        height: media.height,
        sizeBytes: media.sizeBytes,
        dataBase64: media.dataBase64,
        variants: media.variants,
        createdAt: media.createdAt,
        createdBy: media.createdBy.toString(),
    };
}

export async function getMediaBuffer(
    id: string,
    variant?: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
    const media = await Media.findById(id).lean();
    if (!media) return null;

    if (variant) {
        const v = media.variants.find((v) => v.name === variant);
        if (v) {
            return {
                buffer: Buffer.from(v.dataBase64, 'base64'),
                contentType: v.contentType,
            };
        }
    }

    return {
        buffer: Buffer.from(media.dataBase64, 'base64'),
        contentType: media.contentType,
    };
}

export async function deleteMedia(id: string, userId: string): Promise<boolean> {
    const media = await Media.findById(id);
    if (!media) return false;

    await Media.deleteOne({ _id: id });

    const user = await User.findById(userId);
    if (user) {
        await AuditLog.create({
            actorUserId: userId,
            actorEmail: user.email,
            action: 'delete',
            entityType: 'media',
            entityId: id,
            diffSummary: `Deleted: ${media.originalName}`,
        });
    }

    return true;
}
