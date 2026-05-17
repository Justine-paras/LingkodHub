import express from "express";
import request from "supertest";
import bcrypt from "bcryptjs";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const state = {
  users: [],
  refreshTokens: [],
  nextUserId: 1,
};

function resetState() {
  state.users = [];
  state.refreshTokens = [];
  state.nextUserId = 1;
}

vi.mock("../db.js", () => {
  const db = {
    __reset: resetState,
    prepare(sql) {
      const normalized = sql.replace(/\s+/g, " ").trim();

      return {
        run: (...args) => {
          if (normalized.startsWith("INSERT INTO users")) {
            const [
              role,
              full_name,
              username,
              avatar_url,
              email,
              password_hash,
              phone,
              location,
              about_me,
              payment_method,
            ] = args;
            const user = {
              id: state.nextUserId++,
              role,
              full_name,
              username,
              avatar_url,
              email,
              password_hash,
              phone,
              location,
              about_me,
              payment_method,
            };
            state.users.push(user);
            return { lastInsertRowid: user.id, changes: 1 };
          }

          if (normalized.startsWith("INSERT INTO refresh_tokens")) {
            const [user_id, token_hash, expires_at] = args;
            state.refreshTokens.push({
              user_id,
              token_hash,
              expires_at,
              revoked_at: null,
              replaced_by_token_hash: null,
            });
            return { changes: 1 };
          }

          if (
            normalized.startsWith(
              "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP, replaced_by_token_hash = COALESCE",
            )
          ) {
            const [replacementHash, tokenHash] = args;
            let changes = 0;
            for (const row of state.refreshTokens) {
              if (row.token_hash === tokenHash && row.revoked_at === null) {
                row.revoked_at = new Date().toISOString();
                row.replaced_by_token_hash =
                  replacementHash ?? row.replaced_by_token_hash;
                changes++;
              }
            }
            return { changes };
          }

          if (
            normalized.startsWith(
              "UPDATE users SET password_hash = ? WHERE id = ?",
            )
          ) {
            const [hash, userId] = args;
            const user = state.users.find((u) => u.id === userId);
            if (user) {
              user.password_hash = hash;
              return { changes: 1 };
            }
            return { changes: 0 };
          }

          if (
            normalized.startsWith(
              "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ?",
            )
          ) {
            const [userId] = args;
            let changes = 0;
            for (const row of state.refreshTokens) {
              if (row.user_id === userId && row.revoked_at === null) {
                row.revoked_at = new Date().toISOString();
                changes++;
              }
            }
            return { changes };
          }

          return { changes: 0, lastInsertRowid: 0 };
        },
        get: (...args) => {
          if (
            normalized ===
            "SELECT id, role, full_name, username, avatar_url, email, payment_method FROM users WHERE id = ?"
          ) {
            const user = state.users.find((u) => u.id === Number(args[0]));
            if (!user) return undefined;
            return {
              id: user.id,
              role: user.role,
              full_name: user.full_name,
              username: user.username,
              avatar_url: user.avatar_url,
              email: user.email,
              payment_method: user.payment_method,
            };
          }

          if (normalized === "SELECT * FROM users WHERE email = ?") {
            return state.users.find((u) => u.email === args[0]);
          }

          if (normalized === "SELECT id, role FROM users WHERE id = ?") {
            const user = state.users.find((u) => u.id === Number(args[0]));
            if (!user) return undefined;
            return { id: user.id, role: user.role };
          }

          if (
            normalized.startsWith(
              "SELECT user_id FROM refresh_tokens WHERE token_hash = ?",
            )
          ) {
            const tokenHash = args[0];
            const row = state.refreshTokens.find(
              (r) => r.token_hash === tokenHash && r.revoked_at === null,
            );
            if (!row) return undefined;
            if (new Date(row.expires_at).getTime() <= Date.now())
              return undefined;
            return { user_id: row.user_id };
          }

          if (normalized === "SELECT * FROM users WHERE id = ?") {
            return state.users.find((u) => u.id === Number(args[0]));
          }

          return undefined;
        },
        all: () => [],
      };
    },
  };

  return { default: db };
});

let authRouter;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret-for-auth-suite";
  authRouter = (await import("../routes/auth.js")).default;
});

beforeEach(async () => {
  const db = (await import("../db.js")).default;
  db.__reset();
});

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRouter);
  return app;
}

function getCookie(headers, cookieName) {
  if (!headers) return undefined;
  const list = Array.isArray(headers) ? headers : [headers];
  const raw = list.find((h) => h.startsWith(`${cookieName}=`));
  return raw?.split(";")[0];
}

async function registerDefaultUser(app) {
  return request(app).post("/api/auth/register").send({
    role: "client",
    full_name: "Test User",
    username: "testuser",
    avatar_url: "",
    email: "test@example.com",
    password: "password123",
    phone: "",
    location: "",
    about_me: "",
    payment_method: "none",
  });
}

describe("Auth refresh token security", () => {
  it("rotates refresh token and rejects old token reuse", async () => {
    const app = makeApp();
    const registerRes = await registerDefaultUser(app);
    expect(registerRes.status).toBe(201);

    const oldRefresh = getCookie(
      registerRes.headers["set-cookie"],
      "refresh_token",
    );
    expect(oldRefresh).toBeTruthy();

    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", [oldRefresh]);
    expect(refreshRes.status).toBe(200);

    const newRefresh = getCookie(
      refreshRes.headers["set-cookie"],
      "refresh_token",
    );
    expect(newRefresh).toBeTruthy();
    expect(newRefresh).not.toBe(oldRefresh);

    const reuseRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", [oldRefresh]);
    expect(reuseRes.status).toBe(403);
  });

  it("revokes refresh token on logout", async () => {
    const app = makeApp();
    const registerRes = await registerDefaultUser(app);
    const refreshCookie = getCookie(
      registerRes.headers["set-cookie"],
      "refresh_token",
    );
    expect(refreshCookie).toBeTruthy();

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", [refreshCookie]);
    expect(logoutRes.status).toBe(200);

    const refreshAfterLogout = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", [refreshCookie]);
    expect(refreshAfterLogout.status).toBe(403);
  });

  it("revokes all active sessions after password change", async () => {
    const app = makeApp();
    const registerRes = await registerDefaultUser(app);
    expect(registerRes.status).toBe(201);

    const sessionACookies = registerRes.headers["set-cookie"];
    const accessA = getCookie(sessionACookies, "access_token");
    const refreshA = getCookie(sessionACookies, "refresh_token");
    expect(accessA).toBeTruthy();
    expect(refreshA).toBeTruthy();

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    expect(loginRes.status).toBe(200);

    const refreshB = getCookie(loginRes.headers["set-cookie"], "refresh_token");
    expect(refreshB).toBeTruthy();

    const changePasswordRes = await request(app)
      .post("/api/auth/change-password")
      .set("Cookie", [accessA])
      .send({
        currentPassword: "password123",
        newPassword: "newPassword123",
      });
    expect(changePasswordRes.status).toBe(200);

    const refreshARes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", [refreshA]);
    expect(refreshARes.status).toBe(403);

    const refreshBRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", [refreshB]);
    expect(refreshBRes.status).toBe(403);

    const reloginRes = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "newPassword123",
    });
    expect(reloginRes.status).toBe(200);
    const user = state.users.find((u) => u.email === "test@example.com");
    expect(user).toBeTruthy();
    expect(bcrypt.compareSync("newPassword123", user.password_hash)).toBe(true);
  });
});
