import { Router } from "express";
import { z } from "zod";
import db, { notify } from "../db.js";
import { authenticateToken, requireVerified } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createJobSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().optional().nullable(),
  location: z.string().min(2).max(150),
  budget: z.number().positive().max(1_000_000),
  is_negotiable: z.boolean().optional().default(false),
  is_urgent: z.boolean().optional().default(false),
  payment_method: z.enum(["gcash", "maya"]).optional().default("gcash"),
  provider_id: z.number().optional().nullable(),
  scheduled_at: z.string().optional().nullable(),
});

const updateJobStatusSchema = z.object({
  status: z.enum(["in_progress", "completed", "cancelled"]),
});

const applyToJobSchema = z.object({
  message: z.string().max(1000).optional().default(""),
});

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().default(""),
});

// ─── Job List & Create ────────────────────────────────────────────────────────

router.get("/", authenticateToken, (req, res) => {
  const view = String(req.query.view || "");
  const status = String(req.query.status || "");

  if (req.user.role === "client") {
    let sql = `
      SELECT j.*, u.full_name AS provider_name, u.avatar_url AS provider_avatar
      FROM jobs j
      LEFT JOIN users u ON j.provider_id = u.id
      WHERE j.client_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      sql += " AND j.status = ?";
      params.push(status);
    } else if (view === "history") {
      sql += " AND j.status IN ('completed', 'cancelled')";
    } else if (view === "ongoing") {
      sql += " AND j.status = 'in_progress'";
    }

    sql += " ORDER BY j.created_at DESC";
    res.json(db.prepare(sql).all(...params));
  } else {
    if (
      view === "assigned" ||
      view === "history" ||
      view === "ongoing" ||
      status
    ) {
      let sql = `
        SELECT j.*, u.full_name AS client_name, u.avatar_url AS client_avatar, u.phone AS client_phone
        FROM jobs j
        JOIN users u ON j.client_id = u.id
        WHERE j.provider_id = ?
      `;
      const params = [req.user.id];

      if (status) {
        sql += " AND j.status = ?";
        params.push(status);
      } else if (view === "history") {
        sql += " AND j.status IN ('completed', 'cancelled')";
      } else if (view === "ongoing") {
        sql += " AND j.status = 'in_progress'";
      } else if (view === "assigned") {
        sql += " AND j.status IN ('pending', 'in_progress')";
      } else {
        sql += " AND j.status IN ('in_progress', 'completed', 'cancelled')";
      }

      sql += " ORDER BY j.created_at DESC";
      res.json(db.prepare(sql).all(...params));
      return;
    }

    // Provider sees pending jobs: either public or specifically assigned to them
    res.json(
      db
        .prepare(
          `
      SELECT j.*, u.full_name AS client_name, u.avatar_url AS client_avatar
      FROM jobs j
      JOIN users u ON j.client_id = u.id
      WHERE j.status = 'pending'
        AND (j.provider_id IS NULL OR j.provider_id = ?)
        AND j.id NOT IN (SELECT job_id FROM applications WHERE provider_id = ?)
      ORDER BY j.created_at DESC
    `,
        )
        .all(req.user.id, req.user.id),
    );
  }
});

router.post(
  "/",
  authenticateToken,
  requireVerified,
  validate(createJobSchema),
  (req, res) => {
    if (req.user.role !== "client") {
      res.status(403).json({ error: "Only clients can create jobs." });
      return;
    }
    const {
      title,
      description,
      category,
      location,
      budget,
      is_negotiable,
      is_urgent,
      payment_method,
      provider_id,
      scheduled_at,
    } = req.body;
    const result = db
      .prepare(
        `
    INSERT INTO jobs (client_id, title, description, category, location, budget, is_negotiable, is_urgent, payment_method, provider_id, scheduled_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
      )
      .run(
        req.user.id,
        title,
        description ?? "",
        category || "General",
        location,
        budget,
        is_negotiable ? 1 : 0,
        is_urgent ? 1 : 0,
        payment_method ?? "gcash",
        provider_id || null,
        scheduled_at || null,
      );

    if (provider_id) {
      notify(
        provider_id,
        "job_invitation",
        "New Job Invitation",
        `You have been invited to a new job: "${title}".`,
        Number(result.lastInsertRowid),
      );
    }

    res
      .status(201)
      .json(
        db
          .prepare("SELECT * FROM jobs WHERE id = ?")
          .get(result.lastInsertRowid),
      );
  },
);

// ─── Bulk Actions ─────────────────────────────────────────────────────────────
router.post("/bulk-delete", authenticateToken, (req, res) => {
  const { ids } = req.body;
  console.log(
    `[jobs] Bulk delete request for IDs:`,
    ids,
    "by user:",
    req.user.id,
  );
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: "IDs array is required." });
    return;
  }

  try {
    const results = db.transaction(() => {
      let deletedCount = 0;
      for (const id of ids) {
        const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
        if (!job) {
          console.log(`[jobs] Job ${id} not found for deletion`);
          continue;
        }

        const isClient = job.client_id === req.user.id;
        const isProvider = job.provider_id === req.user.id;
        // Providers can only delete completed/cancelled. Clients can delete pending/completed/cancelled.
        const canDelete =
          isClient ||
          (isProvider && ["completed", "cancelled"].includes(job.status));

        if (
          canDelete &&
          ["pending", "completed", "cancelled"].includes(job.status)
        ) {
          db.prepare("DELETE FROM jobs WHERE id = ?").run(id);
          deletedCount++;
        } else {
          console.log(
            `[jobs] User ${req.user.id} cannot delete job ${id} (status: ${job.status}, role: ${req.user.role})`,
          );
        }
      }
      return deletedCount;
    })();

    console.log(`[jobs] Bulk delete success. Deleted ${results} items.`);
    res.json({ success: true, deletedCount: results });
  } catch (err) {
    console.error("[jobs] Bulk delete error:", err);
    res.status(500).json({ error: "Failed to perform bulk deletion." });
  }
});

// ─── Single Job ───────────────────────────────────────────────────────────────

router.get("/:id", authenticateToken, (req, res) => {
  const job = db
    .prepare(
      `
    SELECT j.*,
      c.full_name AS client_name, c.avatar_url AS client_avatar,
      c.phone AS client_phone, c.location AS client_location,
      p.full_name AS provider_name, p.avatar_url AS provider_avatar,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) AS application_count
    FROM jobs j
    JOIN users c ON j.client_id = c.id
    LEFT JOIN users p ON j.provider_id = p.id
    WHERE j.id = ?
  `,
    )
    .get(req.params.id);

  if (!job) {
    res.status(404).json({ error: "Job not found." });
    return;
  }
  if (req.user.role === "client" && job.client_id !== req.user.id) {
    res.status(403).json({ error: "Forbidden." });
    return;
  }
  res.json(job);
});

router.delete("/:id", authenticateToken, (req, res) => {
  const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found." });
    return;
  }

  const isClient = job.client_id === req.user.id;
  const isProvider = job.provider_id === req.user.id;
  if (!isClient && !isProvider) {
    res.status(403).json({ error: "Forbidden." });
    return;
  }
  // Providers can only delete completed/cancelled jobs. Clients can delete pending too.
  const canDelete =
    isClient || (isProvider && ["completed", "cancelled"].includes(job.status));
  if (!canDelete) {
    res
      .status(403)
      .json({
        error: "Providers can only delete completed or cancelled jobs.",
      });
    return;
  }
  if (!["pending", "completed", "cancelled"].includes(job.status)) {
    res
      .status(400)
      .json({
        error: "Only pending, completed, or cancelled jobs can be deleted.",
      });
    return;
  }

  db.prepare("DELETE FROM jobs WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// [KEYWORD: #JOB_STATUS_TRANSITION]
// PURPOSE: Governs state transitions for a job booking (State Machine).
// HOW IT WORKS: 
// 1. Checks if the caller is the authorized Client or Provider.
// 2. Looks up the current status and validates if the transition is allowed based on a strict mapping:
//    - 'pending' can move to 'in_progress' or 'cancelled'.
//    - 'in_progress' can move to 'completed' or 'cancelled'.
// 3. Updates the 'jobs' table 'status' in SQLite.
// 4. Triggers background notifications to both parties on completion.
router.put(
  "/:id/status",
  authenticateToken,
  validate(updateJobStatusSchema),
  (req, res) => {
    const job = db
      .prepare("SELECT * FROM jobs WHERE id = ?")
      .get(req.params.id);
    if (!job) {
      res.status(404).json({ error: "Job not found." });
      return;
    }

    const { status } = req.body;
    const isClient =
      req.user.role === "client" && job.client_id === req.user.id;
    const isProvider =
      req.user.role === "provider" && job.provider_id === req.user.id;
    if (!isClient && !isProvider) {
      res.status(403).json({ error: "Forbidden." });
      return;
    }

    const allowed = {
      pending: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };
    if (!allowed[job.status]?.includes(status)) {
      res
        .status(400)
        .json({
          error: `Cannot transition from '${job.status}' to '${status}'.`,
        });
      return;
    }

    db.prepare("UPDATE jobs SET status = ? WHERE id = ?").run(
      status,
      req.params.id,
    );

    if (status === "completed") {
      notify(
        job.client_id,
        "job_completed",
        "Job Completed",
        `"${job.title}" has been marked as completed.`,
        job.id,
      );
      notify(
        job.provider_id,
        "job_completed",
        "Job Completed",
        `"${job.title}" has been marked as completed. Leave a review!`,
        job.id,
      );
    } else if (status === "cancelled") {
      const otherId = isClient ? job.provider_id : job.client_id;
      if (otherId)
        notify(
          otherId,
          "job_cancelled",
          "Job Cancelled",
          `"${job.title}" has been cancelled.`,
          job.id,
        );
    }

    res.json(db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id));
  },
);

// ─── Applications on a Job ────────────────────────────────────────────────────

router.post(
  "/:id/apply",
  authenticateToken,
  requireVerified,
  validate(applyToJobSchema),
  (req, res) => {
    if (req.user.role !== "provider") {
      res.status(403).json({ error: "Only providers can apply to jobs." });
      return;
    }
    const job = db
      .prepare("SELECT * FROM jobs WHERE id = ?")
      .get(req.params.id);
    if (!job) {
      res.status(404).json({ error: "Job not found." });
      return;
    }
    if (job.status !== "pending") {
      res
        .status(400)
        .json({ error: "This job is no longer accepting applications." });
      return;
    }

    const existing = db
      .prepare(
        "SELECT id FROM applications WHERE job_id = ? AND provider_id = ?",
      )
      .get(req.params.id, req.user.id);
    if (existing) {
      res.status(409).json({ error: "You have already applied to this job." });
      return;
    }

    const result = db
      .prepare(
        "INSERT INTO applications (job_id, provider_id, message) VALUES (?, ?, ?)",
      )
      .run(req.params.id, req.user.id, req.body.message ?? "");

    notify(
      job.client_id,
      "new_application",
      "New Application Received",
      `A provider has applied to your job: "${job.title}".`,
      Number(req.params.id),
    );

    res
      .status(201)
      .json(
        db
          .prepare("SELECT * FROM applications WHERE id = ?")
          .get(result.lastInsertRowid),
      );
  },
);

router.get("/:id/applications", authenticateToken, (req, res) => {
  if (req.user.role !== "client") {
    res.status(403).json({ error: "Only clients can view applications." });
    return;
  }
  const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found." });
    return;
  }
  if (job.client_id !== req.user.id) {
    res.status(403).json({ error: "Forbidden." });
    return;
  }

  res.json(
    db
      .prepare(
        `
    SELECT a.*,
      u.full_name, u.avatar_url, u.phone, u.location, u.about_me,
      (SELECT GROUP_CONCAT(s.name, ', ')
        FROM provider_services ps JOIN services s ON ps.service_id = s.id
        WHERE ps.provider_id = u.id
      ) AS services
    FROM applications a
    JOIN users u ON a.provider_id = u.id
    WHERE a.job_id = ?
    ORDER BY a.created_at ASC
  `,
      )
      .all(req.params.id),
  );
});

// ─── Reviews on a Job ─────────────────────────────────────────────────────────

router.post(
  "/:id/review",
  authenticateToken,
  requireVerified,
  validate(createReviewSchema),
  (req, res) => {
    const job = db
      .prepare("SELECT * FROM jobs WHERE id = ?")
      .get(req.params.id);
    if (!job) {
      res.status(404).json({ error: "Job not found." });
      return;
    }
    if (job.status !== "completed") {
      res.status(400).json({ error: "Only completed jobs can be reviewed." });
      return;
    }

    const isClient = job.client_id === req.user.id;
    const isProvider = job.provider_id === req.user.id;
    if (!isClient && !isProvider) {
      res.status(403).json({ error: "Forbidden." });
      return;
    }

    const existing = db
      .prepare("SELECT id FROM reviews WHERE job_id = ? AND reviewer_id = ?")
      .get(req.params.id, req.user.id);
    if (existing) {
      res.status(409).json({ error: "You have already reviewed this job." });
      return;
    }

    const reviewee_id = isClient ? job.provider_id : job.client_id;
    const { rating, comment } = req.body;

    const result = db
      .prepare(
        "INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
      )
      .run(req.params.id, req.user.id, reviewee_id, rating, comment ?? "");

    const reviewer = db
      .prepare("SELECT full_name FROM users WHERE id = ?")
      .get(req.user.id);
    notify(
      reviewee_id,
      "new_review",
      "New Review Posted",
      `${reviewer?.full_name} left you a ${rating}-star review.`,
      Number(req.params.id),
    );

    res
      .status(201)
      .json(
        db
          .prepare("SELECT * FROM reviews WHERE id = ?")
          .get(result.lastInsertRowid),
      );
  },
);

export default router;
