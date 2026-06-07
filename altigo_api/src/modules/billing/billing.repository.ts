import { pool } from '../../config/database';
import type { TransactionStatus, TransactionType } from '../../shared/types';

export const billingRepository = {
  async findUserBillingInfo(userId: string) {
    const { rows } = await pool.query(
      `SELECT id, role, subscription_status, subscription_expires_at,
              stripe_customer_id, stripe_subscription_id
       FROM users WHERE id = $1`,
      [userId],
    );
    return rows[0] ?? null;
  },

  async findUserIdByStripeCustomer(stripeCustomerId: string): Promise<string | null> {
    const { rows } = await pool.query('SELECT id FROM users WHERE stripe_customer_id = $1', [
      stripeCustomerId,
    ]);
    return rows[0]?.id ?? null;
  },

  async insertTransaction(params: {
    userId: string;
    type: TransactionType;
    status: TransactionStatus;
    amountCents: number;
    currency: string;
    stripePaymentIntentId?: string | null;
    stripeInvoiceId?: string | null;
    rawPayload: unknown;
  }) {
    const { rows } = await pool.query(
      `INSERT INTO transactions
         (user_id, type, status, amount_cents, currency,
          stripe_payment_intent_id, stripe_invoice_id, raw_payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        params.userId,
        params.type,
        params.status,
        params.amountCents,
        params.currency,
        params.stripePaymentIntentId ?? null,
        params.stripeInvoiceId ?? null,
        JSON.stringify(params.rawPayload),
      ],
    );
    return rows[0];
  },

  async activatePremium(params: {
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    expiresAt: Date;
  }) {
    await pool.query(
      `UPDATE users
       SET role = 'premium',
           subscription_status = 'active',
           stripe_customer_id = $2,
           stripe_subscription_id = $3,
           subscription_expires_at = $4,
           updated_at = now()
       WHERE id = $1`,
      [params.userId, params.stripeCustomerId, params.stripeSubscriptionId, params.expiresAt],
    );
  },

  async downgradeToFree(userId: string, status: 'canceled' | 'past_due') {
    await pool.query(
      `UPDATE users
       SET role = 'free', subscription_status = $2, updated_at = now()
       WHERE id = $1`,
      [userId, status],
    );
  },
};
