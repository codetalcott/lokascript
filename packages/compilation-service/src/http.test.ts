/**
 * HTTP Wrapper Tests
 *
 * Uses Hono's built-in app.request() — no actual server needed.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from './http.js';
import { CompilationService } from './service.js';
import type { Hono } from 'hono';

// Pre-create service so each test doesn't wait for lazy init
let app: Hono;

beforeAll(async () => {
  const service = await CompilationService.create();
  app = createApp({ service });
}, 30000);

// =============================================================================
// Health
// =============================================================================

describe('GET /health', () => {
  it('returns ok and version', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.version).toBeDefined();
  });
});

// =============================================================================
// Compile
// =============================================================================

describe('POST /compile', () => {
  it('compiles explicit syntax', async () => {
    const res = await app.request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explicit: '[toggle patient:.active destination:#btn]' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.js).toBeDefined();
    expect(body.semantic).toBeDefined();
  });

  it('compiles natural language', async () => {
    const res = await app.request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'on click toggle .active', language: 'en' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.js).toBeDefined();
  });

  it('returns 422 for invalid input', async () => {
    const res = await app.request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'xyzzy blorp', language: 'en', confidence: 0.9 }),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });
});

// =============================================================================
// Validate
// =============================================================================

describe('POST /validate', () => {
  it('validates explicit syntax', async () => {
    const res = await app.request('/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explicit: '[add patient:.highlight destination:#panel]' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.semantic).toBeDefined();
  });
});

// =============================================================================
// Translate
// =============================================================================

describe('POST /translate', () => {
  it('translates between languages', async () => {
    const res = await app.request('/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'toggle .active', from: 'en', to: 'es' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.code).toBeDefined();
  });
});

// =============================================================================
// Generate Tests
// =============================================================================

describe('POST /generate-tests', () => {
  it('generates tests from explicit syntax', async () => {
    const res = await app.request('/generate-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explicit: '[toggle patient:.active]' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.tests).toHaveLength(1);
    expect(body.operations.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// Generate Component
// =============================================================================

describe('POST /generate-component', () => {
  it('generates React component from explicit syntax', async () => {
    const res = await app.request('/generate-component', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explicit: '[toggle patient:.active destination:#btn]' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.component).toBeDefined();
    expect(body.component.framework).toBe('react');
  });
});

// =============================================================================
// Cache
// =============================================================================

describe('Cache endpoints', () => {
  it('GET /cache/stats returns stats', async () => {
    const res = await app.request('/cache/stats');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('size');
    expect(body).toHaveProperty('hits');
    expect(body).toHaveProperty('misses');
  });

  it('DELETE /cache clears the cache', async () => {
    const res = await app.request('/cache', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});

// =============================================================================
// Error Handling
// =============================================================================

describe('Error handling', () => {
  it('returns 500 for malformed JSON', async () => {
    const res = await app.request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid json}',
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.diagnostics).toBeDefined();
  });
});

// =============================================================================
// API Key Auth
// =============================================================================

describe('API key authentication', () => {
  let authedApp: Hono;

  beforeAll(async () => {
    const service = await CompilationService.create();
    authedApp = createApp({ service, apiKey: 'test-secret-key' });
  }, 30000);

  it('rejects unauthenticated requests', async () => {
    const res = await authedApp.request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explicit: '[toggle patient:.active]' }),
    });

    expect(res.status).toBe(401);
  });

  it('allows authenticated requests', async () => {
    const res = await authedApp.request('/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-secret-key',
      },
      body: JSON.stringify({ explicit: '[toggle patient:.active]' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('health check bypasses auth', async () => {
    const res = await authedApp.request('/health');
    expect(res.status).toBe(200);
  });
});
