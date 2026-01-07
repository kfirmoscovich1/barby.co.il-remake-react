import { Router } from 'express';
import { z } from 'zod';
import {
    createShowSchema,
    updateShowSchema,
    showsQuerySchema,
    updatePageSchema,
    pageKeySchema,
    updateSiteSettingsSchema,
    createUserSchema,
    updateUserSchema,
    mediaQuerySchema,
    objectIdSchema,
} from '../validation/index.js';
import {
    authenticate,
    authorize,
    validateBody,
    validateQuery,
    validateParams,
    upload,
    type AuthRequest,
} from '../middleware/index.js';
import * as showService from '../services/show.service.js';
import * as pageService from '../services/page.service.js';
import * as settingsService from '../services/settings.service.js';
import * as mediaService from '../services/media.service.js';
import * as userService from '../services/user.service.js';
import * as auditService from '../services/audit.service.js';
import * as faqService from '../services/faq.service.js';
import { createUser } from '../services/auth.service.js';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// ==========================================
// Shows Routes
// ==========================================

// GET /api/admin/shows
router.get(
    '/shows',
    validateQuery(showsQuerySchema),
    async (req, res, next) => {
        try {
            const result = await showService.getShows(
                req.query as Parameters<typeof showService.getShows>[0],
                true // include unpublished
            );
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/admin/shows/:id
router.get(
    '/shows/:id',
    validateParams(z.object({ id: objectIdSchema })),
    async (req, res, next) => {
        try {
            const result = await showService.getShowById(req.params.id);
            if (!result) {
                res.status(404).json({ success: false, error: 'הופעה לא נמצאה' });
                return;
            }
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/admin/shows
router.post(
    '/shows',
    validateBody(createShowSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const result = await showService.createShow(req.body, req.userId!);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /api/admin/shows/:id
router.put(
    '/shows/:id',
    validateParams(z.object({ id: objectIdSchema })),
    validateBody(updateShowSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const result = await showService.updateShow(req.params.id, req.body, req.userId!);
            if (!result) {
                res.status(404).json({ success: false, error: 'הופעה לא נמצאה' });
                return;
            }
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// DELETE /api/admin/shows/:id
router.delete(
    '/shows/:id',
    authorize('admin'),
    validateParams(z.object({ id: objectIdSchema })),
    async (req: AuthRequest, res, next) => {
        try {
            const deleted = await showService.deleteShow(req.params.id, req.userId!);
            if (!deleted) {
                res.status(404).json({ success: false, error: 'הופעה לא נמצאה' });
                return;
            }
            res.json({ success: true, message: 'ההופעה נמחקה בהצלחה' });
        } catch (error) {
            next(error);
        }
    }
);

// ==========================================
// Pages Routes
// ==========================================

// GET /api/admin/pages
router.get('/pages', async (_req, res, next) => {
    try {
        const result = await pageService.getAllPages();
        // Return in paginated format for consistency
        res.json({
            success: true,
            data: {
                items: result,
                total: result.length,
                page: 1,
                limit: result.length,
                totalPages: 1,
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/pages/:key
router.get(
    '/pages/:key',
    validateParams(z.object({ key: pageKeySchema })),
    async (req, res, next) => {
        try {
            const result = await pageService.getPageByKey(req.params.key as Parameters<typeof pageService.getPageByKey>[0]);
            if (!result) {
                res.status(404).json({ success: false, error: 'עמוד לא נמצא' });
                return;
            }
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /api/admin/pages/:key
router.put(
    '/pages/:key',
    validateParams(z.object({ key: pageKeySchema })),
    validateBody(updatePageSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const result = await pageService.updatePage(
                req.params.key as Parameters<typeof pageService.updatePage>[0],
                req.body,
                req.userId!
            );
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// ==========================================
// Site Settings Routes
// ==========================================

// GET /api/admin/site-settings
router.get('/site-settings', async (_req, res, next) => {
    try {
        const result = await settingsService.getSiteSettings();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/site-settings
router.put(
    '/site-settings',
    validateBody(updateSiteSettingsSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const result = await settingsService.updateSiteSettings(req.body, req.userId!);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// ==========================================
// Media Routes
// ==========================================

// GET /api/admin/media
router.get(
    '/media',
    validateQuery(mediaQuerySchema),
    async (req, res, next) => {
        try {
            const result = await mediaService.getMediaList(req.query as Parameters<typeof mediaService.getMediaList>[0]);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/admin/media
router.post(
    '/media',
    upload.single('file'),
    async (req: AuthRequest, res, next) => {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, error: 'קובץ חסר' });
                return;
            }
            const result = await mediaService.uploadMedia(req.file, req.userId!);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// DELETE /api/admin/media/:id
router.delete(
    '/media/:id',
    authorize('admin'),
    validateParams(z.object({ id: objectIdSchema })),
    async (req: AuthRequest, res, next) => {
        try {
            const deleted = await mediaService.deleteMedia(req.params.id, req.userId!);
            if (!deleted) {
                res.status(404).json({ success: false, error: 'קובץ לא נמצא' });
                return;
            }
            res.json({ success: true, message: 'הקובץ נמחק בהצלחה' });
        } catch (error) {
            next(error);
        }
    }
);

// ==========================================
// Users Routes (Admin Only)
// ==========================================

// GET /api/admin/users
router.get('/users', authorize('admin'), async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await userService.getUsers({ page, limit });
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/users/:id
router.get(
    '/users/:id',
    authorize('admin'),
    validateParams(z.object({ id: objectIdSchema })),
    async (req, res, next) => {
        try {
            const result = await userService.getUserById(req.params.id);
            if (!result) {
                res.status(404).json({ success: false, error: 'משתמש לא נמצא' });
                return;
            }
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/admin/users
router.post(
    '/users',
    authorize('admin'),
    validateBody(createUserSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const result = await createUser(
                req.body.email,
                req.body.password,
                req.body.role,
                req.userId
            );
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ success: false, error: error.message });
            } else {
                next(error);
            }
        }
    }
);

// PUT /api/admin/users/:id
router.put(
    '/users/:id',
    authorize('admin'),
    validateParams(z.object({ id: objectIdSchema })),
    validateBody(updateUserSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const result = await userService.updateUser(req.params.id, req.body, req.userId!);
            if (!result) {
                res.status(404).json({ success: false, error: 'משתמש לא נמצא' });
                return;
            }
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// DELETE /api/admin/users/:id
router.delete(
    '/users/:id',
    authorize('admin'),
    validateParams(z.object({ id: objectIdSchema })),
    async (req: AuthRequest, res, next) => {
        try {
            const deleted = await userService.deleteUser(req.params.id, req.userId!);
            if (!deleted) {
                res.status(404).json({ success: false, error: 'משתמש לא נמצא' });
                return;
            }
            res.json({ success: true, message: 'המשתמש נמחק בהצלחה' });
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ success: false, error: error.message });
            } else {
                next(error);
            }
        }
    }
);

// ==========================================
// Audit Routes (Read Only)
// ==========================================

// GET /api/admin/audit
router.get('/audit', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const entityType = req.query.entityType as string | undefined;
        const action = req.query.action as string | undefined;
        const userId = req.query.userId as string | undefined;

        const result = await auditService.getAuditLogs({
            page,
            limit,
            entityType,
            action,
            userId,
        });
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// ==================== FAQ Routes ====================

// GET /api/admin/faq - Get all FAQs
router.get('/faq', async (req, res, next) => {
    try {
        const result = await faqService.getAllFAQs();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/faq/categories - Get FAQ categories
router.get('/faq/categories', async (req, res, next) => {
    try {
        const result = await faqService.getFAQCategories();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/faq/:id - Get single FAQ
router.get(
    '/faq/:id',
    validateParams(z.object({ id: objectIdSchema })),
    async (req, res, next) => {
        try {
            const result = await faqService.getFAQById(req.params.id);
            if (!result) {
                res.status(404).json({ success: false, error: 'שאלה לא נמצאה' });
                return;
            }
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/admin/faq - Create FAQ
router.post(
    '/faq',
    validateBody(z.object({
        question: z.string().min(1, 'שאלה נדרשת'),
        answer: z.string().min(1, 'תשובה נדרשת'),
        category: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
    })),
    async (req: AuthRequest, res, next) => {
        try {
            const result = await faqService.createFAQ(req.body, req.userId!);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /api/admin/faq/:id - Update FAQ
router.put(
    '/faq/:id',
    validateParams(z.object({ id: objectIdSchema })),
    validateBody(z.object({
        question: z.string().min(1).optional(),
        answer: z.string().min(1).optional(),
        category: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
    })),
    async (req: AuthRequest, res, next) => {
        try {
            const result = await faqService.updateFAQ(req.params.id, req.body, req.userId!);
            if (!result) {
                res.status(404).json({ success: false, error: 'שאלה לא נמצאה' });
                return;
            }
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// DELETE /api/admin/faq/:id - Delete FAQ
router.delete(
    '/faq/:id',
    validateParams(z.object({ id: objectIdSchema })),
    async (req: AuthRequest, res, next) => {
        try {
            const deleted = await faqService.deleteFAQ(req.params.id, req.userId!);
            if (!deleted) {
                res.status(404).json({ success: false, error: 'שאלה לא נמצאה' });
                return;
            }
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/admin/faq/reorder - Reorder FAQs
router.post(
    '/faq/reorder',
    validateBody(z.object({
        ids: z.array(objectIdSchema),
    })),
    async (req: AuthRequest, res, next) => {
        try {
            await faqService.reorderFAQs(req.body.ids, req.userId!);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
