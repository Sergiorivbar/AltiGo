CREATE TYPE transaction_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE transaction_type AS ENUM ('subscription_create', 'subscription_renewal', 'subscription_cancel');

CREATE TABLE transactions (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Stripe identifiers (test mode, e.g. "pi_test_...", "sub_test_...")
    stripe_payment_intent_id VARCHAR(120),
    stripe_invoice_id        VARCHAR(120),

    type                     transaction_type NOT NULL,
    status                   transaction_status NOT NULL DEFAULT 'pending',
    amount_cents             INTEGER NOT NULL,
    currency                 CHAR(3) NOT NULL DEFAULT 'eur',

    raw_payload              JSONB,

    created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_id ON transactions (user_id);
CREATE INDEX idx_transactions_status ON transactions (status);
