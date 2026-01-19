import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { showsQuerySchema, pageKeySchema } from '../validation/index.js';
import { validateQuery, validateParams } from '../middleware/index.js';
import * as showService from '../services/show.service.js';
import * as pageService from '../services/page.service.js';
import * as settingsService from '../services/settings.service.js';
import * as faqService from '../services/faq.service.js';

const router = Router();

// Middleware to add cache headers for public routes
function setCacheHeaders(maxAge: number) {
    return (_req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
        next();
    };
}

// GET /api/public/shows
router.get(
    '/shows',
    setCacheHeaders(30), // 30 seconds cache
    validateQuery(showsQuerySchema),
    async (req, res, next) => {
        try {
            const result = await showService.getShows({
                ...req.query,
                archived: false,
            } as Parameters<typeof showService.getShows>[0]);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/public/shows/featured
router.get('/shows/featured', setCacheHeaders(60), async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit as string) || 6;
        const result = await showService.getFeaturedShows(limit);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// GET /api/public/shows/upcoming
router.get('/shows/upcoming', setCacheHeaders(60), async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit as string) || 12;
        const result = await showService.getUpcomingShows(limit);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// GET /api/public/shows/:id
router.get(
    '/shows/:id',
    setCacheHeaders(60), // 1 minute cache for individual shows
    validateParams(z.object({ id: z.string() })),
    async (req, res, next) => {
        try {
            // Try by slug first (more common), then by ID
            let result = await showService.getShowBySlug(req.params.id);

            if (!result) {
                // Only try by ID if it looks like a valid ObjectId
                if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
                    result = await showService.getShowById(req.params.id);
                }
            }

            if (!result) {
                res.status(404).json({ success: false, error: 'הופעה לא נמצאה' });
                return;
            }

            // Only return published shows publicly
            if (!result.published) {
                res.status(404).json({ success: false, error: 'הופעה לא נמצאה' });
                return;
            }

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/public/archive
router.get(
    '/archive',
    setCacheHeaders(120), // 2 minutes cache for archive
    validateQuery(showsQuerySchema),
    async (req, res, next) => {
        try {
            const result = await showService.getShows({
                ...req.query,
                archived: true,
            } as Parameters<typeof showService.getShows>[0]);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/public/pages/:key
router.get(
    '/pages/:key',
    setCacheHeaders(300), // 5 minutes cache for pages (rarely change)
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

// GET /api/public/site-settings
router.get('/site-settings', setCacheHeaders(300), async (req, res, next) => {
    try {
        const result = await settingsService.getSiteSettings();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// GET /api/public/faq
router.get('/faq', setCacheHeaders(300), async (req, res, next) => {
    try {
        const result = await faqService.getActiveFAQs();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

export default router;
