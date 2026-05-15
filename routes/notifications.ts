import { Router, Response } from 'express';
import db from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all notifications for the current user
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const notifications = db.prepare(`
    SELECT id, user_id, title, body AS message, type, is_read, reference_id, created_at FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `).all(req.user!.id);
  
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0')
    .get(req.user!.id) as { count: number };
  
  res.json({ 
    notifications, 
    unread_count: unreadCount.count 
  });
});

// Mark a notification as read
router.put('/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user!.id);
    
  res.json({ success: true });
});

// Mark all as read
router.put('/read-all', authenticateToken, (req: AuthRequest, res: Response) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?')
    .run(req.user!.id);
    
  res.json({ success: true });
});

// Delete a notification
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user!.id);
    
  res.json({ success: true });
});

export default router;
