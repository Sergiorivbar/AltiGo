import type { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';

export const userController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getProfile(req.user!.id);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
};
