import { Router } from "express";
import { z } from "zod";
import db, { notify } from "../db.js";
import { authenticateToken, requireVerified } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const sendMessageSchema = z.object({
  receiver_id: z.number().int().positive(),
  job_id: z.number().int().positive().optional(),
  content: z.string().min(1).max(2000),
});

// List all conversations (one entry per partner, showing latest message)
router.get("/conversations", authenticateToken, (req, res) => {
  const me = req.user.id;
  const rows = db
    .prepare(
      `
    WITH convos AS (
      SELECT
        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_id,
        MAX(id) AS last_msg_id
      FROM job_events
      WHERE sender_id = ? OR receiver_id = ?
      GROUP BY other_id
    )
    SELECT
      m.id, m.content, m.is_read, m.created_at, m.sender_id,
      u.id AS other_id, u.full_name AS other_name, u.avatar_url AS other_avatar,
      (SELECT COUNT(*) FROM job_events
        WHERE receiver_id = ? AND sender_id = c.other_id AND is_read = 0) AS unread_count
    FROM convos c
    JOIN job_events m ON m.id = c.last_msg_id
    JOIN users u ON u.id = c.other_id
    ORDER BY m.created_at DESC
  `,
    )
    .all(me, me, me, me);
  res.json(rows);
});

// Full thread between current user and another user
router.get("/:userId", authenticateToken, (req, res) => {
  const me = req.user.id;
  const other = Number(req.params.userId);
  if (isNaN(other)) {
    res.status(400).json({ error: "Invalid user ID." });
    return;
  }

  const messages = db
    .prepare(
      `
    SELECT m.*, s.full_name AS sender_name, s.avatar_url AS sender_avatar
    FROM job_events m
    JOIN users s ON m.sender_id = s.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?)
       OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC
    LIMIT 200
  `,
    )
    .all(me, other, other, me);

  // Auto mark received messages as read
  db.prepare(
    "UPDATE job_events SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0",
  ).run(me, other);

  res.json(messages);
});

// Send a message
router.post(
  "/",
  authenticateToken,
  requireVerified,
  validate(sendMessageSchema),
  (req, res) => {
    const { receiver_id, job_id, content } = req.body;

    const receiver = db
      .prepare("SELECT id, full_name FROM users WHERE id = ?")
      .get(receiver_id);
    if (!receiver) {
      res.status(404).json({ error: "Receiver not found." });
      return;
    }
    if (receiver_id === req.user.id) {
      res.status(400).json({ error: "Cannot message yourself." });
      return;
    }

    const result = db
      .prepare(
        "INSERT INTO job_events (sender_id, receiver_id, job_id, content) VALUES (?, ?, ?, ?)",
      )
      .run(req.user.id, receiver_id, job_id ?? null, content);

    const sender = db
      .prepare("SELECT full_name FROM users WHERE id = ?")
      .get(req.user.id);
    const preview =
      content.length > 60 ? content.slice(0, 60) + "..." : content;
    notify(
      receiver_id,
      "new_message",
      "New Message",
      `${sender?.full_name} sent you a message: "${preview}"`,
      req.user.id,
    );

    res
      .status(201)
      .json(
        db
          .prepare("SELECT * FROM job_events WHERE id = ?")
          .get(result.lastInsertRowid),
      );
  },
);

// Mark all messages from a sender as read
router.put("/read/:userId", authenticateToken, (req, res) => {
  const other = Number(req.params.userId);
  if (isNaN(other)) {
    res.status(400).json({ error: "Invalid user ID." });
    return;
  }
  const info = db
    .prepare(
      "UPDATE job_events SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0",
    )
    .run(req.user.id, other);
  res.json({ marked: info.changes });
});

export default router;
