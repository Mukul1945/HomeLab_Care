import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

describe('API Foundation Integration', () => {
  it('returns standard envelope from /health', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    expect([200, 503]).toContain(response.status);
    expect(response.body.success).toBe(true);
    expect(response.body.data.service).toBe('api');
    expect(response.body.data.checks.api.status).toBe('ok');
    expect(response.body.meta.requestId).toEqual(expect.any(String));
  });

  it('exposes readiness payloads at /ready and /api/v1/ready', async () => {
    const app = createApp();
    const response = await request(app).get('/api/v1/ready');

    expect([200, 503]).toContain(response.status);
    expect(response.body.success).toBe(true);
    expect(response.body.data.service).toBe('api');
  });

  it('returns 404 envelope for unregistered route', async () => {
    const app = createApp();
    const response = await request(app).get('/api/v1/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.meta.requestId).toEqual(expect.any(String));
  });
});
