/**
 * Timeout Middleware
 *
 * Aborts request processing after the configured duration.
 * Returns 504 Gateway Timeout.
 */

import type { MiddlewareHandler } from 'hono';

export function timeout(ms: number = 10_000): MiddlewareHandler {
  return async (c, next) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);

    try {
      const result = await Promise.race([
        next(),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('Request timeout'));
          });
        }),
      ]);
      return result;
    } catch (err) {
      if (err instanceof Error && err.message === 'Request timeout') {
        return c.json(
          {
            ok: false,
            diagnostics: [
              {
                severity: 'error',
                code: 'REQUEST_TIMEOUT',
                message: `Request timed out after ${ms}ms`,
              },
            ],
          },
          504
        );
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  };
}
