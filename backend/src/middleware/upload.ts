import multer from 'multer';
import { Request } from 'express';
import { config } from '../config/index.js';

const storage = multer.memoryStorage();

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes: readonly string[] = config.upload.allowedMimeTypes;
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`סוג קובץ לא נתמך: ${file.mimetype}`));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.maxFileSize,
    },
});
