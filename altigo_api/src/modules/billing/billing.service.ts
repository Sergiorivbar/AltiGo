import type Stripe from 'stripe';
import { stripeClient } from '../../config/stripe';
import { env } from '../../config/env';
import { billingRepository } from './billing.repository';
import { AppError } from '../../shared/errors/app-error';
import type { SubscriptionStatusResponse } from './billing.types';

const PREMIUM_PLAN_AMOUNT_CENTS = 499; // 4.99 € / month — informational only in test mode
const DEFAULT_TEST_PAYMENT_METHOD = 'pm_card_visa'; // Stripe predefined test PM (always succeeds)

export const billingService = {
  /**
   * Source of truth Flutter queries to decide whether to show the AdMob
   * interstitial before starting a route (FREE) or skip it (PREMIUM).
   */
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResponse> {
    const user = await billingRepository.findUserBillingInfo(userId);
    if (!user) throw new AppError('USER_NOT_FOUND', 'Usuario no encontrado', 404);

    // Lazily downgrade if the subscription period has already elapsed
    if (
      user.subscription_status === 'active' &&
      user.subscription_expires_at &&
      new Date(user.subscription_expires_at) < new Date()
    ) {
      await billingRepository.downgradeToFree(userId, 'canceled');
      user.role = 'free';
      user.subscription_status = 'canceled';
    }

    return {
      role: user.role,
      subscriptionStatus: user.subscription_status,
      expiresAt: user.subscription_expires_at,
      isPremium: user.role === 'premium' && user.subscription_status === 'active',
    };
  },

  /**
   * Creates/reuses a Stripe test Customer and simulates charging the Premium
   * subscription with a Stripe test PaymentMethod (card 4242 4242 4242 4242).
   */
  async subscribeToPremium(userId: string, userEmail: string, paymentMethodId?: string) {
    const user = await billingRepository.findUserBillingInfo(userId);
    if (!user) throw new AppError('USER_NOT_FOUND', 'Usuario no encontrado', 404);

    if (user.role === 'premium' && user.subscription_status === 'active') {
      throw new AppError('ALREADY_PREMIUM', 'El usuario ya tiene un plan Premium activo', 409);
    }

    const customerId =
      user.stripe_customer_id ??
      (await stripeClient.customers.create({ email: userEmail, metadata: { userId } })).id;

    const testPaymentMethod = paymentMethodId ?? DEFAULT_TEST_PAYMENT_METHOD;
    await stripeClient.paymentMethods
      .attach(testPaymentMethod, { customer: customerId })
      .catch(() => null); // already attached in test mode — safe to ignore

    await stripeClient.customers.update(customerId, {
      invoice_settings: { default_payment_method: testPaymentMethod },
    });

    const subscription = await stripeClient.subscriptions.create({
      customer: customerId,
      items: [{ price: env.PREMIUM_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent | null;
    const succeeded = subscription.status === 'active' || paymentIntent?.status === 'succeeded';

    await billingRepository.insertTransaction({
      userId,
      type: 'subscription_create',
      status: succeeded ? 'succeeded' : 'failed',
      amountCents: PREMIUM_PLAN_AMOUNT_CENTS,
      currency: 'eur',
      stripePaymentIntentId: paymentIntent?.id ?? null,
      stripeInvoiceId: invoice.id,
      rawPayload: subscription,
    });

    if (!succeeded) {
      throw new AppError('PAYMENT_FAILED', 'No se pudo procesar el pago de la suscripción', 402);
    }

    const periodEnd = new Date(subscription.current_period_end * 1000);
    await billingRepository.activatePremium({
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      expiresAt: periodEnd,
    });

    return billingService.getSubscriptionStatus(userId);
  },

  /** Reacts to Stripe events: renewals, cancellations, failed payments. */
  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = await billingRepository.findUserIdByStripeCustomer(invoice.customer as string);
        if (!userId) break;

        await billingRepository.insertTransaction({
          userId,
          type: 'subscription_renewal',
          status: 'succeeded',
          amountCents: invoice.amount_paid,
          currency: invoice.currency,
          stripeInvoiceId: invoice.id,
          rawPayload: invoice,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await billingRepository.findUserIdByStripeCustomer(subscription.customer as string);
        if (userId) await billingRepository.downgradeToFree(userId, 'canceled');
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = await billingRepository.findUserIdByStripeCustomer(invoice.customer as string);
        if (userId) await billingRepository.downgradeToFree(userId, 'past_due');
        break;
      }

      default:
        break;
    }
  },
};
