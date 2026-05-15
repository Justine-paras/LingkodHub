import { Router, Response } from 'express';
import { z } from 'zod';
import db, { notify } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createInviteSchema = z.object({
  job_id: z.number(),
  provider_id: z.number(),
  message: z.string().max(500).optional(),
  offered_price: z.number().positive().optional(),
});

// Client sends an invite
router.post('/', authenticateToken, validate(createInviteSchema), (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'client') {
    res.status(403).json({ error: 'Only clients can send job invites.' }); return;
  }

  const { job_id, provider_id, message, offered_price } = req.body;

  // Verify job belongs to client
  const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND client_id = ?').get(job_id, req.user!.id) as any;
  if (!job) {
    res.status(404).json({ error: 'Job not found or unauthorized.' }); return;
  }

  // Verify provider exists
  const provider = db.prepare('SELECT * FROM users WHERE id = ? AND role = "provider"').get(provider_id);
  if (!provider) {
    res.status(404).json({ error: 'Provider not found.' }); return;
  }

  // Check if already invited
  const existing = db.prepare('SELECT * FROM job_invites WHERE job_id = ? AND provider_id = ? AND status = "pending"').get(job_id, provider_id);
  if (existing) {
    res.status(400).json({ error: 'Invite already pending for this provider.' }); return;
  }

  const result = db.prepare(`
    INSERT INTO job_invites (job_id, provider_id, client_id, message, offered_price)
    VALUES (?, ?, ?, ?, ?)
  `).run(job_id, provider_id, req.user!.id, message || null, offered_price || null);

  notify(
    provider_id,
    'job_invite',
    'New Job Invitation',
    `${req.user!.full_name} invited you to work on "${job.title}".`,
    Number(result.lastInsertRowid)
  );

  res.status(201).json({ id: result.lastInsertRowid, message: 'Invite sent successfully.' });
});

// Get invites for the current user
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user!.role === 'provider') {
    // Providers see invites received
    const invites = db.prepare(`
      SELECT i.*, j.title as job_title, j.description as job_description, u.full_name as client_name, u.avatar_url as client_avatar
      FROM job_invites i
      JOIN jobs j ON i.job_id = j.id
      JOIN users u ON i.client_id = u.id
      WHERE i.provider_id = ?
      ORDER BY i.created_at DESC
    `).all(req.user!.id);
    res.json(invites);
  } else {
    // Clients see invites sent
    const invites = db.prepare(`
      SELECT i.*, j.title as job_title, u.full_name as provider_name, u.avatar_url as provider_avatar
      FROM job_invites i
      JOIN jobs j ON i.job_id = j.id
      JOIN users u ON i.provider_id = u.id
      WHERE i.client_id = ?
      ORDER BY i.created_at DESC
    `).all(req.user!.id);
    res.json(invites);
  }
});

// Update invite status (Accept/Reject)
router.patch('/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!['accepted', 'rejected', 'cancelled'].includes(status)) {
    res.status(400).json({ error: 'Invalid status.' }); return;
  }

  const invite = db.prepare('SELECT * FROM job_invites WHERE id = ?').get(req.params.id) as any;
  if (!invite) {
    res.status(404).json({ error: 'Invite not found.' }); return;
  }

  // Authorization
  if (req.user!.role === 'provider' && invite.provider_id !== req.user!.id) {
    res.status(403).json({ error: 'Unauthorized.' }); return;
  }
  if (req.user!.role === 'client' && invite.client_id !== req.user!.id) {
    res.status(403).json({ error: 'Unauthorized.' }); return;
  }

  db.prepare('UPDATE job_invites SET status = ? WHERE id = ?').run(status, req.params.id);

  if (status === 'accepted') {
    // Check if job still available
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(invite.job_id) as any;
    if (job.status !== 'pending') {
       // Maybe allow multiple accepted invites? No, usually one provider per job.
    }

    // Auto-create accepted application
    db.prepare(`
      INSERT INTO applications (job_id, provider_id, status, message)
      VALUES (?, ?, 'accepted', 'Invited and accepted.')
    `).run(invite.job_id, invite.provider_id);
    
    // Assign provider and update job status
    db.prepare('UPDATE jobs SET provider_id = ?, status = "in_progress" WHERE id = ?').run(invite.provider_id, invite.job_id);

    notify(
      invite.client_id,
      'invite_accepted',
      'Invitation Accepted',
      `Provider has accepted your invitation for the job.`,
      invite.job_id
    );
  } else if (status === 'rejected') {
    notify(
      invite.client_id,
      'invite_rejected',
      'Invitation Declined',
      `Provider has declined your invitation.`,
      invite.job_id
    );
  }

  res.json({ message: `Invite ${status}.` });
});

export default router;
