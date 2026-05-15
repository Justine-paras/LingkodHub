import { Router, Response } from 'express';
import { z } from 'zod';
import db from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

const providersQuerySchema = z.object({
  service:  z.string().max(100).optional(),
  location: z.string().max(150).optional(),
  q:        z.string().max(100).optional(),
});

// Searchable provider directory
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const query = providersQuerySchema.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: 'Invalid query parameters.' }); return; }

  const { service, location, q } = query.data;

  let sql = `
    SELECT u.id, u.full_name, u.avatar_url, u.location, u.about_me, u.created_at, u.is_documents_verified,
      GROUP_CONCAT(s.name, ', ') AS services
    FROM users u
    LEFT JOIN provider_services ps ON u.id = ps.provider_id
    LEFT JOIN services s ON ps.service_id = s.id
    WHERE u.role = 'provider'
  `;
  const params: any[] = [];

  if (service) {
    sql += ` AND u.id IN (SELECT ps2.provider_id FROM provider_services ps2 JOIN services s2 ON ps2.service_id = s2.id WHERE LOWER(s2.name) LIKE LOWER(?))`;
    params.push(`%${service}%`);
  }
  if (location) {
    sql += ` AND LOWER(u.location) LIKE LOWER(?)`;
    params.push(`%${location}%`);
  }
  if (q) {
    sql += ` AND (
      LOWER(u.full_name) LIKE LOWER(?) 
      OR LOWER(u.about_me) LIKE LOWER(?)
      OR u.id IN (SELECT ps3.provider_id FROM provider_services ps3 JOIN services s3 ON ps3.service_id = s3.id WHERE LOWER(s3.name) LIKE LOWER(?))
    )`;
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  sql += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT 50`;
  res.json(db.prepare(sql).all(...params));
});

// Provider public profile
router.get('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const provider = db.prepare(`
    SELECT u.id, u.full_name, u.avatar_url, u.location, u.about_me, u.created_at, u.is_documents_verified,
      GROUP_CONCAT(s.name, ', ') AS services
    FROM users u
    LEFT JOIN provider_services ps ON u.id = ps.provider_id
    LEFT JOIN services s ON ps.service_id = s.id
    WHERE u.id = ? AND u.role = 'provider'
    GROUP BY u.id
  `).get(req.params.id);

  if (!provider) { res.status(404).json({ error: 'Provider not found.' }); return; }
  res.json(provider);
});

// Reviews for any user (client or provider)
router.get('/:id/reviews', authenticateToken, (_req, res: Response) => {
  // Note: this is mounted at /api/users/:id/reviews via server.ts
  res.status(501).json({ error: 'Use /api/users/:id/reviews instead.' });
});

export default router;
