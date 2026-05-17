import { Router, Response } from 'express';
import { z } from 'zod';
import db from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const updateMeSchema = z.object({
  full_name:  z.string().min(2).max(100).optional(),
  username:   z.string().max(50).optional(),
  avatar_url: z.string().optional().or(z.literal('')),
  phone:      z.string().max(30).optional(),
  location:   z.string().max(150).optional(),
  about_me:   z.string().max(500).optional(),
  service_radius: z.number().int().min(1).max(100).optional(),
  pref_email_messages: z.number().int().min(0).max(1).optional(),
  pref_email_updates: z.number().int().min(0).max(1).optional(),
  pref_email_promos: z.number().int().min(0).max(1).optional(),
  pref_push_alerts: z.number().int().min(0).max(1).optional(),
  pref_push_marketing: z.number().int().min(0).max(1).optional(),
  is_public_profile: z.number().int().min(0).max(1).optional(),
  show_online_status: z.number().int().min(0).max(1).optional(),
  gcash_number: z.string().max(20).optional().or(z.literal('')),
  maya_number: z.string().max(20).optional().or(z.literal('')),
  payment_method: z.string().max(50).optional().or(z.literal('')),
});

const updateServicesSchema = z.object({
  services: z.array(z.string().min(1).max(100)).max(50),
});

const addressSchema = z.object({
  label: z.string().min(1).max(50),
  address_text: z.string().min(5).max(255),
  is_default: z.number().int().min(0).max(1).optional(),
});

// ─── Profile ──────────────────────────────────────────────────────────────────

router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = db.prepare(
    'SELECT id, role, full_name, username, avatar_url, email, phone, location, about_me, payment_method, gcash_number, maya_number, service_radius, is_email_verified, is_documents_verified, document_status, verification_document_url, verification_selfie_url, pref_email_messages, pref_email_updates, pref_email_promos, pref_push_alerts, pref_push_marketing, is_public_profile, show_online_status, created_at FROM users WHERE id = ?'
  ).get(req.user!.id);
  if (!user) { res.status(404).json({ error: 'User not found.' }); return; }
  res.json(user);
});
 
router.post('/me/avatar', authenticateToken, upload.single('avatar'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
 
  const avatarUrl = `/uploads/${req.file.filename}`;
  db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, req.user!.id);
 
  res.json({ avatar_url: avatarUrl });
});

router.put('/me', authenticateToken, validate(updateMeSchema), (req: AuthRequest, res: Response) => {
  const { 
    full_name, username, avatar_url, phone, location, about_me, service_radius,
    pref_email_messages, pref_email_updates, pref_email_promos, pref_push_alerts, pref_push_marketing,
    is_public_profile, show_online_status, gcash_number, maya_number, payment_method
  } = req.body;

  const updates: string[] = [];
  const params: any[]     = [];

  if (full_name  !== undefined) { updates.push('full_name = ?');  params.push(full_name); }
  if (username   !== undefined) { updates.push('username = ?');   params.push(username); }
  if (avatar_url !== undefined) { updates.push('avatar_url = ?'); params.push(avatar_url); }
  if (phone      !== undefined) { updates.push('phone = ?');      params.push(phone); }
  if (location   !== undefined) { updates.push('location = ?');   params.push(location); }
  if (about_me   !== undefined) { updates.push('about_me = ?');   params.push(about_me); }
  if (service_radius !== undefined) { updates.push('service_radius = ?'); params.push(service_radius); }
  if (pref_email_messages !== undefined) { updates.push('pref_email_messages = ?'); params.push(pref_email_messages); }
  if (pref_email_updates !== undefined) { updates.push('pref_email_updates = ?'); params.push(pref_email_updates); }
  if (pref_email_promos !== undefined) { updates.push('pref_email_promos = ?'); params.push(pref_email_promos); }
  if (pref_push_alerts !== undefined) { updates.push('pref_push_alerts = ?'); params.push(pref_push_alerts); }
  if (pref_push_marketing !== undefined) { updates.push('pref_push_marketing = ?'); params.push(pref_push_marketing); }
  if (is_public_profile !== undefined) { updates.push('is_public_profile = ?'); params.push(is_public_profile); }
  if (show_online_status !== undefined) { updates.push('show_online_status = ?'); params.push(show_online_status); }
  if (gcash_number !== undefined) { updates.push('gcash_number = ?'); params.push(gcash_number); }
  if (maya_number !== undefined) { updates.push('maya_number = ?'); params.push(maya_number); }
  if (payment_method !== undefined) { updates.push('payment_method = ?'); params.push(payment_method); }

  if (updates.length > 0) {
    params.push(req.user!.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }

  res.json(db.prepare(
    'SELECT id, role, full_name, username, avatar_url, email, phone, location, about_me, payment_method, gcash_number, maya_number, service_radius, is_email_verified, is_documents_verified, document_status, verification_document_url, verification_selfie_url, pref_email_messages, pref_email_updates, pref_email_promos, pref_push_alerts, pref_push_marketing, is_public_profile, show_online_status, created_at FROM users WHERE id = ?'
  ).get(req.user!.id));
});

router.get('/me/billing', authenticateToken, (req: AuthRequest, res: Response) => {
  const payments = db.prepare(`
    SELECT p.*, j.title AS job_title
    FROM payments p
    JOIN jobs j ON p.job_id = j.id
    WHERE p.client_id = ? OR p.provider_id = ?
    ORDER BY p.created_at DESC
  `).all(req.user!.id, req.user!.id);
  res.json(payments);
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

router.delete('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    db.transaction(() => {
      // 1. Clean up references that might not cascade correctly
      db.prepare('UPDATE jobs SET provider_id = NULL WHERE provider_id = ?').run(req.user!.id);
      
      // 2. Delete the user (other tables should cascade)
      db.prepare('DELETE FROM users WHERE id = ?').run(req.user!.id);
    })();

    // 3. Clear auth cookies
    const base = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' };
    res.clearCookie('access_token', base);
    res.clearCookie('refresh_token', base);
    
    res.json({ success: true });
  } catch (err: any) {
    console.error('[DeleteAccount Error]:', err);
    res.status(500).json({ error: 'Failed to delete account due to a database constraint.' });
  }
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
      j.client_id AS client_id,
      c.full_name AS client_name, c.avatar_url AS client_avatar, c.phone AS client_phone
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN users c ON j.client_id = c.id
    WHERE a.provider_id = ?
    ORDER BY a.created_at DESC
  `).all(req.user!.id));
});

router.post('/me/documents', authenticateToken, upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), (req: AuthRequest, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const docFile = files?.['document']?.[0];
  const selfieFile = files?.['selfie']?.[0];

  if (!docFile && !selfieFile) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }

  const currentUser = db.prepare('SELECT verification_document_url, verification_selfie_url FROM users WHERE id = ?').get(req.user!.id) as any;

  const docUrl = docFile ? `/uploads/${docFile.filename}` : currentUser?.verification_document_url;
  const selfieUrl = selfieFile ? `/uploads/${selfieFile.filename}` : currentUser?.verification_selfie_url;

  // Auto-verify if both exist
  const isVerified = (docUrl && selfieUrl) ? 1 : 0;
  const status = isVerified ? 'verified' : 'pending';

  db.prepare('UPDATE users SET verification_document_url = ?, verification_selfie_url = ?, is_documents_verified = ?, document_status = ? WHERE id = ?')
    .run(docUrl || null, selfieUrl || null, isVerified, status, req.user!.id);

  if (isVerified) {
    db.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)')
      .run(req.user!.id, 'Identity Verified', 'Congratulations! Your document and selfie have been verified successfully. You are now a System Verified Provider.', 'success');
  } else {
    db.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)')
      .run(req.user!.id, 'Documents Submitted', 'Your identity documents have been submitted and are under review.', 'info');
  }

  res.json({ 
    document_url: docUrl, 
    selfie_url: selfieUrl,
    is_documents_verified: isVerified,
    status 
  });
});

// ─── Addresses ────────────────────────────────────────────────────────────────

router.get('/me/addresses', authenticateToken, (req: AuthRequest, res: Response) => {
  const addresses = db.prepare('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user!.id);
  res.json(addresses);
});

router.post('/me/addresses', authenticateToken, validate(addressSchema), (req: AuthRequest, res: Response) => {
  const { label, address_text, is_default } = req.body;
  
  // Check max 3 addresses
  const count = db.prepare('SELECT COUNT(*) as count FROM user_addresses WHERE user_id = ?').get(req.user!.id) as { count: number };
  if (count.count >= 3) {
    res.status(400).json({ error: 'You can only have a maximum of 3 saved addresses.' });
    return;
  }

  db.transaction(() => {
    if (is_default) {
      db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user!.id);
    }
    db.prepare('INSERT INTO user_addresses (user_id, label, address_text, is_default) VALUES (?, ?, ?, ?)')
      .run(req.user!.id, label, address_text, is_default || 0);
  })();

  res.json({ success: true });
});

router.delete('/me/addresses/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM user_addresses WHERE id = ? AND user_id = ?').run(id, req.user!.id);
  res.json({ success: true });
});

router.patch('/me/addresses/:id/default', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  db.transaction(() => {
    db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user!.id);
    db.prepare('UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?').run(id, req.user!.id);
  })();

  res.json({ success: true });
});

router.get('/users/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = db.prepare(`
    SELECT u.id, u.role, u.full_name, u.avatar_url, u.location, u.about_me, u.payment_method, u.created_at,
      COALESCE(r.avg_rating, 0) AS avg_rating,
      COALESCE(r.total_reviews, 0) AS total_reviews
    FROM users u
    LEFT JOIN (
      SELECT reviewee_id, AVG(rating) AS avg_rating, COUNT(*) AS total_reviews
      FROM reviews
      GROUP BY reviewee_id
    ) r ON u.id = r.reviewee_id
    WHERE u.id = ?
  `).get(req.params.id);

  if (!user) { res.status(404).json({ error: 'User not found.' }); return; }
  res.json(user);
});

export default router;
