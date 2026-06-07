import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { routeService } from './route.service';

const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(200).optional(),
});

export const routeController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const routes = await routeService.listRoutes();
      res.json({ data: routes });
    } catch (err) {
      next(err);
    }
  },

  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const route = await routeService.getRouteDetail(req.params.id);
      res.json({ data: route });
    } catch (err) {
      next(err);
    }
  },

  async nearby(req: Request, res: Response, next: NextFunction) {
    try {
      const query = nearbyQuerySchema.parse(req.query);
      const routes = await routeService.findRoutesNearby(query.lat, query.lng, query.radiusKm);
      res.json({ data: routes });
    } catch (err) {
      next(err);
    }
  },
};
