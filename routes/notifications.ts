import { Router, Response } from 'express';
import db from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get my notifications (latest 50, unread first)
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const rows = db.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY is_read ASC, created_at DESC
    LIMIT 50
  `).all(req.user!.id);

  const unread = db.prepare(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0'
  ).get(req.user!.id) as any;

  res.json({ notifications: rows, unread_count: unread.count });
});

// Mark all as read — must be defined BEFORE /:id/read to avoid route conflicts
router.put('/read-all', authenticateToken, (req: AuthRequest, res: Response) => {
  const info = db.prepare(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0'
  ).run(req.user!.id);
  res.json({ marked: info.changes });
});

// Mark single notification as read
router.put('/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
  const n = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user!.id) as any;
  if (!n) { res.status(404).json({ error: 'Notification not found.' }); return; }
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
