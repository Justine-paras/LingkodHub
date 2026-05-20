import jwt from "jsonwebtoken";
import db from "../db.js";

// ─── Cookie Parser Helper ──────────────────────────────────────────────────────
function parseCookie(req, name) {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  const cookies = raw.split(";");
  for (const item of cookies) {
    const [key, ...rest] = item.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

// ─── Middleware Guards ─────────────────────────────────────────────────────────

// [KEYWORD: #MIDDLEWARE_AUTH]
// PURPOSE: Protects backend routes by verifying the user's active session.
// HOW IT WORKS: Scans HTTP authorization headers or cookies for a JSON Web Token (JWT).
// If missing, returns 401 (Unauthorized). If invalid/expired, returns 403 (Forbidden).
// On success, decodes user info into req.user and passes control to the next handler.
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader && authHeader.split(" ")[1];
  const cookieToken = parseCookie(req, "access_token");
  const token = bearerToken || cookieToken;

  if (!token) {
    res.sendStatus(401);
    return;
  }

  // JWT_SECRET is guaranteed to be set — checked at server startup
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.sendStatus(403);
      return;
    }
    req.user = decoded;
    next();
  });
};

// [KEYWORD: #EMAIL_VERIFICATION]
// PURPOSE: Restricts certain actions to users who have completed their email validation.
// HOW IT WORKS: Queries the SQLite database to check if the current user has 'is_email_verified = 1'.
// If not verified, blocks the request with a 403 status code and error messages.
export const requireVerified = (req, res, next) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }
  const user = db
    .prepare("SELECT is_email_verified FROM users WHERE id = ?")
    .get(req.user.id);
  if (!user || !user.is_email_verified) {
    res.status(403).json({
      error: "verification_required",
      message: "Email verification required to access this feature.",
    });
    return;
  }
  next();
};

