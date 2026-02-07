/**
 * Body Limit Middleware
 *
 * Rejects requests with Content-Length exceeding the configured limit.
 * Returns 413 Payload Too Large.
 */

import type { MiddlewareHandler } from 'hono';

export function bodyLimit(maxBytes: number = 50 * 1024): MiddlewareHandler {
  return async (c, next) => {
    const contentLength = c.req.header('Content-Length');
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      return c.json(
        {
          ok: false,
          diagnostics: [
            {
              severity: 'error',
              code: 'PAYLOAD_TOO_LARGE',
              message: `Request body exceeds ${maxBytes} bytes`,
            },
          ],
        },
        413
      );
    }
    return next();
  };
}
