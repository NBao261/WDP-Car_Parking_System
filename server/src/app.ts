import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';
import { setupSwagger } from './config/swagger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import facilityRoutes from './routes/facility.routes';
import vehicleTypeRoutes from './routes/vehicleType.routes';
import floorRoutes from './routes/floor.routes';
import slotRoutes from './routes/slot.routes';
import pricingRoutes from './routes/pricing.routes';
import sessionRoutes from './routes/session.routes';
import paymentRoutes from './routes/payment.routes';
import reservationRoutes from './routes/reservation.routes';
import exceptionRoutes from './routes/exception.routes';
import feedbackRoutes from './routes/feedback.routes';
import reportRoutes from './routes/report.routes';
import configRoutes from './routes/config.routes';
import publicRoutes from './routes/public.routes';
import roleRoutes from './routes/role.routes';


const app = express();

// ─── Security ─────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ─── Body Parsing ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ──────────────────────────────────────────
app.use(morgan('combined'));

// ─── API Docs ─────────────────────────────────────────
setupSwagger(app);

// ─── Health Check ─────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/public`, publicRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/facilities`, facilityRoutes);
app.use(`${API_PREFIX}/vehicle-types`, vehicleTypeRoutes);
app.use(`${API_PREFIX}/floors`, floorRoutes);
app.use(`${API_PREFIX}/slots`, slotRoutes);
app.use(`${API_PREFIX}/pricing`, pricingRoutes);
app.use(`${API_PREFIX}/sessions`, sessionRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/reservations`, reservationRoutes);
app.use(`${API_PREFIX}/exceptions`, exceptionRoutes);
app.use(`${API_PREFIX}/feedbacks`, feedbackRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);
app.use(`${API_PREFIX}/config`, configRoutes);
app.use(`${API_PREFIX}/roles`, roleRoutes);


// ─── Error Handling ───────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
