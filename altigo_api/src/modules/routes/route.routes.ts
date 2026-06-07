import { Router } from 'express';
import { routeController } from './route.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

export const routeRouter = Router();

routeRouter.get('/', authMiddleware, routeController.list);
routeRouter.get('/nearby', authMiddleware, routeController.nearby);
routeRouter.get('/:id', authMiddleware, routeController.detail);
