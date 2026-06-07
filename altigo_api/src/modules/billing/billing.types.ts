import { z } from 'zod';

export interface SubscriptionStatusResponse {
  role: 'free' | 'premium' | 'admin';
  subscriptionStatus: 'inactive' | 'active' | 'canceled' | 'past_due';
  expiresAt: string | null;
  isPremium: boolean;
}

export const subscribeSchema = z.object({
  // In test mode we default to Stripe's predefined test payment method (pm_card_visa)
  paymentMethodId: z.string().optional(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
