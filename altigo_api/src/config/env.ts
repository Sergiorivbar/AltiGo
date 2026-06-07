import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(16),

  // Stripe must run in TEST mode for this project (sk_test_ / whsec_ prefixes enforced)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_test_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  PREMIUM_PRICE_ID: z.string().startsWith('price_'),

  MAPBOX_ACCESS_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
