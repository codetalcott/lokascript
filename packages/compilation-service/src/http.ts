/**
 * HTTP/Edge Wrapper for CompilationService
 *
 * Thin Hono server exposing CompilationService over HTTP.
 * Works on Node, Deno, Bun, and Cloudflare Workers.
 *
 * Usage:
 *   import { createApp } from '@lokascript/compilation-service/http';
 *   const app = createApp();
 *   // Use with any Hono-compatible server
 *
 *   import { serve } from '@lokascript/compilation-service/http';
 *   serve({ port: 3001 }); // Starts Node server
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { CompilationService } from './service.js';
import type { CompileRequest, TranslateRequest, TestRequest, ComponentRequest } from './types.js';

// =============================================================================
// Types
// =============================================================================

export interface HttpOptions {
  /** API key for authentication (optional — skips /health) */
  apiKey?: string;
  /** CORS origin (default '*') */
  corsOrigin?: string;
  /** Port for serve() (default 3001) */
  port?: number;
  /** Pre-created service instance (skips lazy init) */
  service?: CompilationService;
}

// =============================================================================
// App Factory
// =============================================================================

/**
 * Create a Hono app wrapping CompilationService.
 * Testable without starting a server — use `app.request()`.
 */
export function createApp(options: HttpOptions = {}): Hono {
  const app = new Hono();

  // Lazy-init service on first request
  let service: CompilationService | null = options.service ?? null;
  let initPromise: Promise<CompilationService> | null = null;

  async function getService(): Promise<CompilationService> {
    if (service) return service;
    if (!initPromise) {
      initPromise = CompilationService.create().then(s => {
        service = s;
        return s;
      });
    }
    return initPromise;
  }

  // --- Middleware ---

  app.use('*', cors({ origin: options.corsOrigin ?? '*' }));

  // API key auth (optional)
  if (options.apiKey) {
    app.use('*', async (c, next) => {
      // Skip auth for health check
      if (new URL(c.req.url).pathname === '/health') {
        return next();
      }
      const auth = c.req.header('Authorization');
      if (auth !== `Bearer ${options.apiKey}`) {
        return c.json({ ok: false, error: 'Unauthorized' }, 401);
      }
      return next();
    });
  }

  // --- Routes ---

  app.get('/health', c => {
    return c.json({ ok: true, version: '1.3.0' });
  });

  app.post('/compile', async c => {
    const svc = await getService();
    const body = await c.req.json<CompileRequest>();
    const result = svc.compile(body);
    return c.json(result, result.ok ? 200 : 422);
  });

  app.post('/validate', async c => {
    const svc = await getService();
    const body = await c.req.json<CompileRequest>();
    const result = svc.validate(body);
    return c.json(result, result.ok ? 200 : 422);
  });

  app.post('/translate', async c => {
    const svc = await getService();
    const body = await c.req.json<TranslateRequest>();
    const result = svc.translate(body);
    return c.json(result, result.ok ? 200 : 422);
  });

  app.post('/generate-tests', async c => {
    const svc = await getService();
    const body = await c.req.json<TestRequest>();
    const result = svc.generateTests(body);
    return c.json(result, result.ok ? 200 : 422);
  });

  app.post('/generate-component', async c => {
    const svc = await getService();
    const body = await c.req.json<ComponentRequest>();
    const result = svc.generateComponent(body);
    return c.json(result, result.ok ? 200 : 422);
  });

  app.get('/cache/stats', async c => {
    const svc = await getService();
    return c.json(svc.getCacheStats());
  });

  app.delete('/cache', async c => {
    const svc = await getService();
    svc.clearCache();
    return c.json({ ok: true });
  });

  // --- Error handler ---

  app.onError((err, c) => {
    return c.json(
      {
        ok: false,
        diagnostics: [
          {
            severity: 'error',
            code: 'INTERNAL_ERROR',
            message: err instanceof Error ? err.message : String(err),
          },
        ],
      },
      500
    );
  });

  return app;
}

// =============================================================================
// Node Server
// =============================================================================

/**
 * Start a Node HTTP server with the compilation service.
 * Convenience for CLI usage; for production, use createApp() with your server.
 */
export async function serve(options: HttpOptions = {}): Promise<void> {
  const { serve: honoServe } = await import('@hono/node-server');
  const app = createApp(options);
  const port = options.port ?? 3001;

  honoServe({ fetch: app.fetch, port });
  console.log(`LokaScript Compilation Service listening on http://localhost:${port}`);
}
