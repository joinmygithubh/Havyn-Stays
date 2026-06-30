import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();

/* ──────────────────────────── Security ──────────────────────────── */

// Secure HTTP headers. crossOriginResourcePolicy relaxed so external image
// CDNs (Unsplash) load without issue when serving any static assets.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — restricted to the configured client origin (not a wildcard) and
// configured to allow credentials (httpOnly auth cookie).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin / server-to-server requests with no Origin header.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Body parsers + cookies.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Strip keys containing `$` / `.` to prevent NoSQL operator injection.
app.use(mongoSanitize());

// Request logging in development.
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global rate limiter on the API surface.
const limiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

/* ──────────────────────────── Routes ──────────────────────────── */

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'Havyn API is healthy', timestamp: new Date().toISOString() })
);

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);

/* ──────────────────── Error handling (last) ──────────────────── */
app.use(notFound);
app.use(errorHandler);

/* ──────────────────────────── Bootstrap ──────────────────────────── */
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🏡  Havyn API running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
  });
});

// Safety nets for unhandled async failures.
process.on('unhandledRejection', (reason) => {
  console.error('✖  Unhandled Rejection:', reason);
});

export default app;
