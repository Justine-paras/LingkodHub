import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { ZodError } from 'zod';
import db, { initDb } from './db.js';

// ─── Route Modules ────────────────────────────────────────────────────────────

import authRouter          from './routes/auth.js';
import usersRouter         from './routes/users.js';
import jobsRouter          from './routes/jobs.js';
import applicationsRouter  from './routes/applications.js';
import providersRouter     from './routes/providers.js';
import messagesRouter      from './routes/messages.js';
import notificationsRouter from './routes/notifications.js';
import supportRouter from './routes/support.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Environment Guards ───────────────────────────────────────────────────────

if (!process.env.JWT_SECRET) {
  throw new Error(
    '[server] JWT_SECRET is not set. Add it to your .env file before starting.'
  );
}
const PORT = parseInt(process.env.PORT || '3000', 10);

// ─── Reviews helper route (user-scoped, lives outside main resource routers) ──

import { Router } from 'express';
import { authenticateToken } from './middleware/auth.js';
const usersReviewRouter = Router({ mergeParams: true });
usersReviewRouter.get('/:id/reviews', authenticateToken, (_req: Request, res: Response) => {
  const reviews = db.prepare(`
    SELECT r.*,
      reviewer.full_name AS reviewer_name, reviewer.avatar_url AS reviewer_avatar,
      j.title AS job_title
    FROM reviews r
    JOIN users reviewer ON r.reviewer_id = reviewer.id
    JOIN jobs j ON r.job_id = j.id
    WHERE r.reviewee_id = ? OR r.reviewer_id = ?
    ORDER BY r.created_at DESC
  `).all(_req.params.id, _req.params.id);

  const avg = db.prepare(
    'SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM reviews WHERE reviewee_id = ?'
  ).get(_req.params.id) as any;

  res.json({ reviews, avg_rating: avg.avg_rating ?? 0, total_reviews: avg.total });
});

// ─── App Bootstrap ────────────────────────────────────────────────────────────

type CreateAppOptions = {
  includeFrontend?: boolean;
};

export async function createApp({ includeFrontend = process.env.NODE_ENV !== 'test' }: CreateAppOptions = {}) {
  initDb();

  const app = express();

  // ── Global Middleware ──────────────────────────────────────────────────────
  app.use(cors({
    origin: process.env.APP_URL || true,
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // ── Health ─────────────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
  });

  // ── Route Mounts ───────────────────────────────────────────────────────────
  app.use('/api/auth',          authRouter);
  app.use('/api',               usersRouter);        // /api/me, /api/me/services, /api/services
  app.use('/api/jobs',          jobsRouter);
  app.use('/api/applications',  applicationsRouter);
  app.use('/api/providers',     providersRouter);
  app.use('/api/messages',      messagesRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/support',       supportRouter);
  app.use('/api/users',         usersReviewRouter);  // /api/users/:id/reviews

  // ── Vite / Static Serving ──────────────────────────────────────────────────
  if (includeFrontend && process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (includeFrontend) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ── Centralized Error Handler ──────────────────────────────────────────────
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'Validation failed', issues: err.flatten() });
      return;
    }
    console.error('[server error]', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  });

  return app;
}

export async function startServer() {
  const app = await createApp();

  // ── Listen ─────────────────────────────────────────────────────────────────
  return app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
