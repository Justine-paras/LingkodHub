import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import db from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

function getCookieOptions(maxAgeMs: number) {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: maxAgeMs,
    path: '/',
  };
}

function parseCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  const cookies = raw.split(';');
  for (const item of cookies) {
    const [key, ...rest] = item.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

function issueAuthCookies(res: Response, token: string, refreshToken: string) {
  res.cookie('access_token', token, getCookieOptions(2 * 60 * 60 * 1000)); // 2h
  res.cookie('refresh_token', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7d
}

function clearAuthCookies(res: Response) {
  const base = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' };
  res.clearCookie('access_token', base);
  res.clearCookie('refresh_token', base);
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function signAccessToken(userId: number, role: 'client' | 'provider') {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET!, { expiresIn: '2h' });
}

function issueRefreshToken(userId: number): string {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ id: userId, jti }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)'
  ).run(userId, hashToken(token), expiresAt);
  return token;
}

function revokeRefreshToken(token: string, replacedByToken?: string) {
  const tokenHash = hashToken(token);
  db.prepare(`
    UPDATE refresh_tokens
    SET revoked_at = CURRENT_TIMESTAMP, replaced_by_token_hash = COALESCE(?, replaced_by_token_hash)
    WHERE token_hash = ? AND revoked_at IS NULL
  `).run(replacedByToken ? hashToken(replacedByToken) : null, tokenHash);
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  role: z.enum(['client', 'provider']),
  full_name: z.string().min(2).max(100),
  username: z.string().max(50).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().max(30).optional(),
  location: z.string().max(150).optional(),
  about_me: z.string().max(500).optional(),
  payment_method: z.string().max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/register', authLimiter, validate(registerSchema), (req: Request, res: Response) => {
  const { role, full_name, username, avatar_url, email, password, phone, location, about_me, payment_method } = req.body;

  try {
    const password_hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (role, full_name, username, avatar_url, email, password_hash, phone, location, about_me, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(role, full_name, username || '', avatar_url || '', email,
           password_hash, phone || '', location || '', about_me || '', payment_method || 'none');

    const user = db.prepare(
      'SELECT id, role, full_name, username, avatar_url, email, payment_method FROM users WHERE id = ?'
    ).get(result.lastInsertRowid) as any;

    const token = signAccessToken(user.id, user.role);
    const refreshToken = issueRefreshToken(user.id);
    issueAuthCookies(res, token, refreshToken);
    res.status(201).json({ user });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    throw err;
  }
});

router.post('/login', authLimiter, validate(loginSchema), (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const { password_hash, ...userWithoutPassword } = user;
  const token = signAccessToken(user.id, user.role);
  const refreshToken = issueRefreshToken(user.id);
  issueAuthCookies(res, token, refreshToken);
  res.json({ user: userWithoutPassword });
});

router.post('/refresh', (req: Request, res: Response) => {
  const refreshToken = parseCookie(req, 'refresh_token') || req.body?.refreshToken;
  if (!refreshToken) { res.sendStatus(401); return; }

  jwt.verify(refreshToken, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) { res.sendStatus(403); return; }
    const tokenRecord = db.prepare(`
      SELECT user_id
      FROM refresh_tokens
      WHERE token_hash = ?
        AND revoked_at IS NULL
        AND expires_at > CURRENT_TIMESTAMP
    `).get(hashToken(refreshToken)) as { user_id: number } | undefined;
    if (!tokenRecord || tokenRecord.user_id !== decoded.id) {
      res.sendStatus(403);
      return;
    }

    const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(decoded.id) as any;
    if (!user) { res.sendStatus(404); return; }

    const newAccessToken = signAccessToken(user.id, user.role);
    const newRefreshToken = issueRefreshToken(user.id);
    revokeRefreshToken(refreshToken, newRefreshToken);

    issueAuthCookies(res, newAccessToken, newRefreshToken);
    res.json({ success: true });
  });
});

router.post('/logout', (req: Request, res: Response) => {
  const refreshToken = parseCookie(req, 'refresh_token');
  if (refreshToken) {
    revokeRefreshToken(refreshToken);
  }
  clearAuthCookies(res);
  res.json({ success: true });
});

router.post('/change-password', authenticateToken, validate(changePasswordSchema), (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!user || !bcrypt.compareSync(req.body.currentPassword, user.password_hash)) {
    res.status(401).json({ error: 'Current password is incorrect.' });
    return;
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .run(bcrypt.hashSync(req.body.newPassword, 10), req.user!.id);
  db.prepare('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL')
    .run(req.user!.id);
  clearAuthCookies(res);
  res.json({ success: true });
});

export default router;
