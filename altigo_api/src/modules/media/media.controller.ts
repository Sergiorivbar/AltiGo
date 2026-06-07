import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/app-error';
import { mediaService } from './media.service';

export const mediaController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('FILE_REQUIRED', 'Debes adjuntar una foto', 422);

      const photo = await mediaService.uploadRoutePhoto({
        routeId: req.params.routeId,
        userId: req.user!.id,
        file: { originalname: req.file.originalname, buffer: req.file.buffer },
        caption: req.body.caption,
      });

      res.status(201).json({ data: photo });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const photos = await mediaService.listRoutePhotos(req.params.routeId);
      res.json({ data: photos });
    } catch (err) {
      next(err);
    }
  },
};
