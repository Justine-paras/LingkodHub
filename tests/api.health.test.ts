import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('better-sqlite3', () => {
  class FakeDatabase {
    pragma() {}
    exec() {}
    prepare() {
      return {
        run: () => ({ changes: 0, lastInsertRowid: 1 }),
        get: () => ({ count: 1 }),
        all: () => [],
      };
    }
  }

  return { default: FakeDatabase };
});

let app: Awaited<ReturnType<(typeof import('../server.js'))['createApp']>>;

beforeAll(async () => {
  const { createApp } = await import('../server.js');
  app = await createApp({ includeFrontend: false });
});

describe('API health', () => {
  it('returns healthy status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      message: 'API is running',
    });
  });
});

afterAll(() => {
  vi.resetModules();
});
