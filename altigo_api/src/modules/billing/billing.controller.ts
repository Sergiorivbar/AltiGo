import type { Request, Response, NextFunction } from 'express';
import { billingService } from './billing.service';
import { stripeClient } from '../../config/stripe';
import { env } from '../../config/env';

export const billingController = {
  // GET /api/billing/subscription-status
  // Flutter calls this to decide whether to show the AdMob interstitial.
  async getSubscriptionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await billingService.getSubscriptionStatus(req.user!.id);
      res.json({ data: status });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/billing/subscribe
  // Simulates upgrading to Premium via Stripe in test mode.
  async subscribeToPremium(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentMethodId } = req.body as { paymentMethodId?: string };
      const result = await billingService.subscribeToPremium(req.user!.id, req.user!.email, paymentMethodId);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/billing/webhook
  // Receives signed Stripe events — requires the raw request body (see billing.routes.ts).
  async handleWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string;

    let event: ReturnType<typeof stripeClient.webhooks.constructEvent>;
    try {
      event = stripeClient.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return res.status(400).send('Webhook signature verification failed');
    }

    await billingService.handleWebhookEvent(event);
    res.json({ received: true });
  },
};
