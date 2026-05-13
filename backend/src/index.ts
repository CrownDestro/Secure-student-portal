import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import connectDB from './config/db';
import logger from './config/logger';
import { apiLimiter } from './middleware/rateLimiter';

import authRoutes   from './routes/auth';
import usersRoutes  from './routes/users';
import filesRoutes  from './routes/files';
import auditRoutes  from './routes/audit';
import attackRoutes from './routes/attack';

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:'],
      objectSrc:  ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods:     ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));          // body size limit
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize());                           // strip $ and . from input
app.use(apiLimiter);                               // global rate limit

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/users',  usersRoutes);
app.use('/api/files',  filesRoutes);
app.use('/api/audit',  auditRoutes);
app.use('/api/attack', attackRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`🚀 Backend running on http://localhost:${PORT}`);
  });
});

export default app;
