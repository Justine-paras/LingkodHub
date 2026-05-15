import { Router, Response } from 'express';
import { z } from 'zod';
import db, { notify } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const applicationDecisionSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});

// Client accepts or rejects an application
router.put('/:id', authenticateToken, validate(applicationDecisionSchema), (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'client') {
    res.status(403).json({ error: 'Only clients can decide on applications.' }); return;
  }

  const application = db.prepare(`
    SELECT a.*, j.client_id, j.status AS job_status, j.title AS job_title
    FROM applications a JOIN jobs j ON a.job_id = j.id
    WHERE a.id = ?
  `).get(req.params.id) as any;

  if (!application)                           { res.status(404).json({ error: 'Application not found.' }); return; }
  if (application.client_id !== req.user!.id) { res.status(403).json({ error: 'Forbidden.' }); return; }
  if (application.job_status !== 'pending')   { res.status(400).json({ error: 'This job is no longer accepting decisions.' }); return; }

  const { status } = req.body;

  if (status === 'accepted') {
    db.transaction(() => {
      db.prepare('UPDATE applications SET status = ? WHERE id = ?').run('accepted', application.id);
      db.prepare('UPDATE applications SET status = ? WHERE job_id = ? AND id != ?').run('rejected', application.job_id, application.id);
      db.prepare('UPDATE jobs SET status = ?, provider_id = ? WHERE id = ?').run('in_progress', application.provider_id, application.job_id);
    })();

    notify(application.provider_id, 'application_accepted', 'Application Accepted! 🎉',
      `Your application for "${application.job_title}" was accepted.`, application.job_id);

    const rejected = db.prepare(
      'SELECT provider_id FROM applications WHERE job_id = ? AND status = ? AND id != ?'
    ).all(application.job_id, 'rejected', application.id) as any[];
    rejected.forEach(r => notify(r.provider_id, 'application_rejected', 'Application Not Selected',
      `Another provider was selected for "${application.job_title}".`, application.job_id));
  } else {
    db.prepare('UPDATE applications SET status = ? WHERE id = ?').run('rejected', application.id);
    notify(application.provider_id, 'application_rejected', 'Application Not Selected',
      `Your application for "${application.job_title}" was not selected this time.`, application.job_id);
  }

  res.json(db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id));
});

// Provider withdraws an application
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'provider') {
    res.status(403).json({ error: 'Only providers can withdraw applications.' }); return;
  }

  const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id) as any;
  if (!application) {
    res.status(404).json({ error: 'Application not found.' }); return;
  }
  if (application.provider_id !== req.user!.id) {
    res.status(403).json({ error: 'Forbidden.' }); return;
  }
  if (application.status !== 'pending') {
    res.status(400).json({ error: 'Cannot withdraw an application that is already accepted or rejected.' }); return;
  }

  db.prepare('DELETE FROM applications WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
