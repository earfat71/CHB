import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import { env } from './lib/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { startCronJobs } from './lib/cron';
import { initSpeedInsights } from './lib/speed-insights';

import authRoutes from './modules/auth/auth.routes';
import hotelRoutes from './modules/hotels/hotel.routes';
import roomRoutes from './modules/rooms/room.routes';
import searchRoutes from './modules/search/search.routes';
import bookingRoutes from './modules/bookings/booking.routes';
import paymentRoutes from './modules/payments/payment.routes';
import agentRoutes from './modules/agents/agent.routes';
import ledgerRoutes from './modules/ledger/ledger.routes';
import settlementRoutes from './modules/settlements/settlement.routes';
import reviewRoutes from './modules/reviews/review.routes';
import adminRoutes from './modules/admin/admin.routes';
import pricingRoutes from './modules/pricing/pricing.routes';
import notificationRoutes from './modules/notifications/notification.routes';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true });
app.use(limiter);

app.use('/uploads', express.static('uploads'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = env.PORT;

app.listen(PORT, async () => {
  logger.info(`CoxBeach API running on port ${PORT}`);
  initSpeedInsights();
  await startCronJobs();
});

export default app;
