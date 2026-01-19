import { Router } from 'express';
import * as mediaService from '../services/media.service.js';

const router = Router();

// GET /api/media/:id - Serve media file as binary
router.get('/:id', async (req, res, next) => {
    try {
        const variant = req.query.variant as string | undefined;
        const result = await mediaService.getMediaBuffer(req.params.id, variant);

        if (!result) {
            res.status(404).json({ success: false, error: 'קובץ לא נמצא' });
            return;
        }

        // Set cache headers (1 year for immutable content)
        res.set({
            'Content-Type': result.contentType,
            'Content-Length': result.buffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
        });

        res.send(result.buffer);
    } catch (error) {
        next(error);
    }
});

export default router;
