import { Router } from 'express';
import express from 'express';
import { billingController } from './billing.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { subscribeSchema } from './billing.types';

export const billingRouter = Router();

// Stripe needs the RAW body to verify the webhook signature, so this route
// is mounted with express.raw() before the global express.json() applies to it.
billingRouter.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  billingController.handleWebhook,
);

billingRouter.get('/subscription-status', authMiddleware, billingController.getSubscriptionStatus);
billingRouter.post(
  '/subscribe',
  authMiddleware,
  validateBody(subscribeSchema),
  billingController.subscribeToPremium,
);
