import { Router } from 'express';
import multer from 'multer';
import { mediaController } from './media.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});

export const mediaRouter = Router({ mergeParams: true });

mediaRouter.get('/:routeId/photos', authMiddleware, mediaController.list);
mediaRouter.post('/:routeId/photos', authMiddleware, upload.single('photo'), mediaController.upload);
