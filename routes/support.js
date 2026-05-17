import { Router } from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { sendEmail } from "../services/email.js";

const router = Router();

// Send a general support email
router.post("/contact", authenticateToken, async (req, res) => {
  const { subject, message } = req.body;
  const user = db
    .prepare("SELECT full_name, email FROM users WHERE id = ?")
    .get(req.user.id);

  try {
    const targetEmail = (process.env.EMAIL_USER || "jparas1014@gmail.com").trim();
    await sendEmail({
      to: targetEmail,
      subject: `[Support Contact] ${subject}`,
      html: `
        <h3>New Support Request</h3>
        <p><strong>From:</strong> ${user?.full_name || "Unknown"} (${user?.email || "Unknown"})</p>
        <p><strong>User ID:</strong> ${req.user.id}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    res.json({ success: true, message: "Support request sent successfully!" });
  } catch (error) {
    console.error("[Support API] Error:", error);
    res.status(500).json({ error: "Failed to send support request." });
  }
});

// Report an issue
router.post("/report", authenticateToken, async (req, res) => {
  const { type, description } = req.body;
  const user = db
    .prepare("SELECT full_name, email FROM users WHERE id = ?")
    .get(req.user.id);

  try {
    const targetEmail = (process.env.EMAIL_USER || "jparas1014@gmail.com").trim();
    await sendEmail({
      to: targetEmail,
      subject: `[Issue Report] ${type}`,
      html: `
        <h3>New Issue Report</h3>
        <p><strong>Reporter:</strong> ${user?.full_name || "Unknown"} (${user?.email || "Unknown"})</p>
        <p><strong>Type:</strong> ${type}</p>
        <hr/>
        <p><strong>Description:</strong></p>
        <p>${description.replace(/\n/g, "<br/>")}</p>
      `,
    });

    res.json({ success: true, message: "Report submitted successfully!" });
  } catch (error) {
    console.error("[Report API] Error:", error);
    res.status(500).json({ error: "Failed to submit report." });
  }
});

export default router;
