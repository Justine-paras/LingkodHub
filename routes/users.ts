import { Router, Response } from 'express';
import { z } from 'zod';
import db from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const updateMeSchema = z.object({
  full_name:  z.string().min(2).max(100).optional(),
  username:   z.string().max(50).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  phone:      z.string().max(30).optional(),
  location:   z.string().max(150).optional(),
  about_me:   z.string().max(500).optional(),
});

const updateServicesSchema = z.object({
  services: z.array(z.string().min(1).max(100)).max(50),
});

// ─── Profile ──────────────────────────────────────────────────────────────────

router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = db.prepare(
    'SELECT id, role, full_name, username, avatar_url, email, phone, location, about_me, payment_method, created_at FROM users WHERE id = ?'
  ).get(req.user!.id);
  if (!user) { res.status(404).json({ error: 'User not found.' }); return; }
  res.json(user);
});

router.put('/me', authenticateToken, validate(updateMeSchema), (req: AuthRequest, res: Response) => {
  const { full_name, username, avatar_url, phone, location, about_me } = req.body;

  const updates: string[] = [];
  const params: any[]     = [];

  if (full_name  !== undefined) { updates.push('full_name = ?');  params.push(full_name); }
  if (username   !== undefined) { updates.push('username = ?');   params.push(username); }
  if (avatar_url !== undefined) { updates.push('avatar_url = ?'); params.push(avatar_url); }
  if (phone      !== undefined) { updates.push('phone = ?');      params.push(phone); }
  if (location   !== undefined) { updates.push('location = ?');   params.push(location); }
  if (about_me   !== undefined) { updates.push('about_me = ?');   params.push(about_me); }

  if (updates.length > 0) {
    params.push(req.user!.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }

  res.json(db.prepare(
    'SELECT id, role, full_name, username, avatar_url, email, phone, location, about_me, payment_method, created_at FROM users WHERE id = ?'
  ).get(req.user!.id));
});

// ─── Services ─────────────────────────────────────────────────────────────────

router.get('/services', (_req, res) => {
  res.json(db.prepare('SELECT * FROM services ORDER BY name ASC').all());
});

router.get('/me/services', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'provider') {
    res.status(403).json({ error: 'Only providers have services.' }); return;
  }
  res.json(db.prepare(`
    SELECT s.id, s.name FROM services s
    JOIN provider_services ps ON s.id = ps.service_id
    WHERE ps.provider_id = ?
  `).all(req.user!.id));
});

router.post('/me/services', authenticateToken, validate(updateServicesSchema), (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'provider') {
    res.status(403).json({ error: 'Only providers have services.' }); return;
  }

  const { services } = req.body;
  db.prepare('DELETE FROM provider_services WHERE provider_id = ?').run(req.user!.id);

  if (services.length > 0) {
    const getServiceId = db.prepare('SELECT id FROM services WHERE name = ?');
    const addService   = db.prepare('INSERT OR IGNORE INTO services (name) VALUES (?)');
    const link         = db.prepare('INSERT INTO provider_services (provider_id, service_id) VALUES (?, ?)');

    db.transaction(() => {
      for (const name of services) {
        addService.run(name);
        const svc = getServiceId.get(name) as any;
        link.run(req.user!.id, svc.id);
      }
    })();
  }
  res.json({ success: true });
});

// ─── My Applications ──────────────────────────────────────────────────────────

router.get('/me/applications', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'provider') {
    res.status(403).json({ error: 'Only providers have applications.' }); return;
  }
  res.json(db.prepare(`
    SELECT a.*,
      j.title, j.description, j.location AS job_location,
      j.budget, j.payment_method, j.status AS job_status,
      c.full_name AS client_name, c.avatar_url AS client_avatar
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN users c ON j.client_id = c.id
    WHERE a.provider_id = ?
    ORDER BY a.created_at DESC
  `).all(req.user!.id));
});

export default router;
