import { Router } from 'express';
import { userController } from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

export const userRouter = Router();

userRouter.get('/me', authMiddleware, userController.getMe);
