import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  id: number;
  role: 'client' | 'provider';
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
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

// ─── Middleware ───────────────────────────────────────────────────────────────

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = parseCookie(req, 'access_token');
  const token = bearerToken || cookieToken;

  if (!token) {
    res.sendStatus(401);
    return;
  }

  // JWT_SECRET is guaranteed to be set — checked at server startup
  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      res.sendStatus(403);
      return;
    }
    req.user = decoded as JwtPayload;
    next();
  });
};
