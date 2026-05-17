import express from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import db from '../db.js';
import authRouter from '../routes/auth.js';
import jobsRouter from '../routes/jobs.js';
import applicationsRouter from '../routes/applications.js';

let app: express.Express;

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-for-review-suite';
  
  app = express();
  app.use(express.json());
  
  app.use('/api/auth', authRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/applications', applicationsRouter);
});

describe('Job Review and Rating Flow', () => {
  it('correctly handles job reviews after completion and calculates average ratings', async () => {
    const timestamp = Date.now();
    const clientEmail = `client.${timestamp}@example.com`;
    const providerEmail = `provider.${timestamp}@example.com`;

    // 1. Register Client
    const clientReg = await request(app)
      .post('/api/auth/register')
      .send({
        role: 'client',
        full_name: 'Test Client',
        email: clientEmail,
        password: 'password123',
        phone: '09170000001',
        location: 'Manila',
        about_me: 'I need services.',
      });
    expect(clientReg.status).toBe(201);
    const clientCookies = clientReg.headers['set-cookie'] as any as string[];
    const clientId = clientReg.body.user.id;
    db.prepare('UPDATE users SET is_email_verified = 1 WHERE id = ?').run(clientId);

    // 2. Register Provider
    const providerReg = await request(app)
      .post('/api/auth/register')
      .send({
        role: 'provider',
        full_name: 'Test Provider',
        email: providerEmail,
        password: 'password123',
        phone: '09170000002',
        location: 'Manila',
        about_me: 'I provide services.',
      });
    expect(providerReg.status).toBe(201);
    const providerCookies = providerReg.headers['set-cookie'] as any as string[];
    const providerId = providerReg.body.user.id;
    db.prepare('UPDATE users SET is_email_verified = 1 WHERE id = ?').run(providerId);

    // 3. Client creates a Job
    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Cookie', clientCookies)
      .send({
        title: 'Review Test Job',
        description: 'Test description',
        location: 'Manila',
        budget: 500,
        is_negotiable: false,
        payment_method: 'gcash',
      });
    expect(jobRes.status).toBe(201);
    const jobId = jobRes.body.id;

    // 4. Provider applies to the Job
    const applyRes = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set('Cookie', providerCookies)
      .send({
        message: 'I can do this job!',
      });
    expect(applyRes.status).toBe(201);
    const appId = applyRes.body.id;

    // 5. Client hires Provider (accepts application)
    const decideRes = await request(app)
      .put(`/api/applications/${appId}`)
      .set('Cookie', clientCookies)
      .send({
        status: 'accepted',
        payment_method: 'gcash',
      });
    expect(decideRes.status).toBe(200);

    // 6. Client starts the job (transitions to in_progress)
    const startRes = await request(app)
      .put(`/api/jobs/${jobId}/status`)
      .set('Cookie', clientCookies)
      .send({
        status: 'in_progress',
      });
    expect(startRes.status).toBe(200);

    // 7. Client attempts to review the job while it is still 'in_progress' - SHOULD FAIL
    const failReviewRes = await request(app)
      .post(`/api/jobs/${jobId}/review`)
      .set('Cookie', clientCookies)
      .send({
        rating: 5,
        comment: 'Great job!',
      });
    expect(failReviewRes.status).toBe(400);
    expect(failReviewRes.body.error).toContain('Only completed jobs can be reviewed');

    // 8. Client completes the job
    const completeRes = await request(app)
      .put(`/api/jobs/${jobId}/status`)
      .set('Cookie', clientCookies)
      .send({
        status: 'completed',
      });
    expect(completeRes.status).toBe(200);

    // 9. Client reviews the completed job - SHOULD SUCCEED
    const successReviewRes = await request(app)
      .post(`/api/jobs/${jobId}/review`)
      .set('Cookie', clientCookies)
      .send({
        rating: 5,
        comment: 'Absolutely amazing work!',
      });
    expect(successReviewRes.status).toBe(201);
    expect(successReviewRes.body.rating).toBe(5);
    expect(successReviewRes.body.comment).toBe('Absolutely amazing work!');

    // 10. Verify that the provider's average rating query returns correct stats
    const avgStats = db.prepare(
      'SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM reviews WHERE reviewee_id = ?'
    ).get(providerId) as any;
    
    expect(avgStats.avg_rating).toBe(5);
    expect(avgStats.total).toBe(1);
  });
});
