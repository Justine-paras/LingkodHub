import express from "express";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { initDb } from "../db.js";
import usersRouter from "../routes/users.js";
import authRouter from "../routes/auth.js";

let app;

beforeAll(() => {
  initDb();
  process.env.JWT_SECRET = "test-secret-for-provider-verification-suite";
  app = express();
  app.use(express.json());
  // Mock routes
  app.use("/api/auth", authRouter);
  app.use("/api", usersRouter);
});

describe("Provider Identity Verification Flow", () => {
  it("automatically sets is_documents_verified to 1 when both files are provided", async () => {
    // 1. Register a provider
    const email = `verified.provider.${Date.now()}.${Math.random().toString(36).substr(2, 9)}@example.com`;
    const registerRes = await request(app).post("/api/auth/register").send({
      role: "provider",
      full_name: "Justine Verified",
      email,
      password: "password123",
      phone: "09170000000",
      location: "Dasmariñas",
      about_me: "Experienced provider bio text.",
    });
    expect(registerRes.status).toBe(201);
    const userId = registerRes.body.user.id;
    // Retrieve cookies
    const cookies = registerRes.headers["set-cookie"];
    expect(cookies).toBeTruthy();

    // 2. Perform document upload via supertest multipart form request
    const buffer = Buffer.from("dummy-image-content");
    const uploadRes = await request(app)
      .post("/api/me/documents")
      .set("Cookie", cookies)
      .attach("document", buffer, "id.png")
      .attach("selfie", buffer, "selfie.png");
    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.is_documents_verified).toBe(1);
    expect(uploadRes.body.status).toBe("verified");
    expect(uploadRes.body.document_url).toBeTruthy();
    expect(uploadRes.body.selfie_url).toBeTruthy();

    // 3. Fetch profile information to verify that the verified state persists
    const meRes = await request(app).get("/api/me").set("Cookie", cookies);
    expect(meRes.status).toBe(200);
    expect(meRes.body.is_documents_verified).toBe(1);
    expect(meRes.body.document_status).toBe("verified");
    expect(meRes.body.about_me).toBe("Experienced provider bio text.");
  });
});
