CREATE TYPE user_role AS ENUM ('free', 'premium', 'admin');
CREATE TYPE subscription_status AS ENUM ('inactive', 'active', 'canceled', 'past_due');

CREATE TABLE users (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email                   VARCHAR(255) UNIQUE NOT NULL,
    password_hash           VARCHAR(255) NOT NULL,
    full_name               VARCHAR(150),
    role                    user_role NOT NULL DEFAULT 'free',

    -- Stripe (test/simulated mode)
    stripe_customer_id      VARCHAR(120),
    stripe_subscription_id  VARCHAR(120),
    subscription_status     subscription_status NOT NULL DEFAULT 'inactive',
    subscription_expires_at TIMESTAMPTZ,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
