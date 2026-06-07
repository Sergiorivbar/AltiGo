import express from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.routes';
import { userRouter } from './modules/users/user.routes';
import { routeRouter } from './modules/routes/route.routes';
import { mediaRouter } from './modules/media/media.routes';
import { billingRouter } from './modules/billing/billing.routes';
import { errorMiddleware } from './middlewares/error.middleware';

export const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
);

// IMPORTANT: billingRouter is mounted BEFORE express.json() because the
// /billing/webhook route needs the raw body to verify the Stripe signature.
app.use('/api/billing', billingRouter);

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/routes', routeRouter);
app.use('/api/routes', mediaRouter);

app.use(errorMiddleware);
