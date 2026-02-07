/**
 * Structured Logger Middleware
 *
 * Emits JSON log lines to stdout for each request.
 * Format: { timestamp, method, path, status, durationMs }
 */

import type { MiddlewareHandler } from 'hono';

export interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
}

export function structuredLogger(): MiddlewareHandler {
  return async (c, next) => {
    const start = Date.now();
    await next();
    const durationMs = Date.now() - start;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: c.req.method,
      path: new URL(c.req.url).pathname,
      status: c.res.status,
      durationMs,
    };

    console.log(JSON.stringify(entry));
  };
}
