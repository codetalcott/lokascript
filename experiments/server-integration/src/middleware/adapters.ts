/**
 * Framework Adapters for Hyperscript Routes
 *
 * Provides adapters for different server frameworks (Express, Koa, Fastify, etc.)
 * Each adapter converts framework-specific request/response to our generic interfaces.
 */

import type { ServerRequest, ServerResponse } from '../events/request-event-source.js';

/**
 * Generic framework adapter interface
 * Frameworks should implement this to integrate with hyperscript routes
 */
export interface FrameworkAdapter<TRequest = any, TResponse = any, TNext = any> {
  /** Framework name for debugging */
  name: string;

  /** Convert framework request to generic ServerRequest */
  toServerRequest(req: TRequest): ServerRequest;

  /** Wrap framework response as ServerResponse */
  wrapServerResponse(res: TResponse): ServerResponse;

  /** Create middleware function for this framework */
  createMiddleware(
    handler: (req: TRequest, res: TResponse, next?: TNext) => void | Promise<void>
  ): any;
}

/**
 * Express Adapter
 */
export function createExpressAdapter(): FrameworkAdapter {
  return {
    name: 'express',

    toServerRequest(req: any): ServerRequest {
      return {
        method: req.method as any,
        url: req.url,
        path: req.path,
        query: req.query as Record<string, string | string[]>,
        params: req.params,
        headers: req.headers as Record<string, string | string[]>,
        body: req.body,
        ip: req.ip,
        originalUrl: req.originalUrl,
      };
    },

    wrapServerResponse(res: any): ServerResponse {
      return {
        status(code: number): ServerResponse {
          res.status(code);
          return this;
        },
        header(name: string, value: string): ServerResponse {
          res.header(name, value);
          return this;
        },
        json(data: unknown): void {
          res.json(data);
        },
        html(content: string): void {
          res.type('html').send(content);
        },
        text(content: string): void {
          res.type('text').send(content);
        },
        redirect(url: string, code?: number): void {
          res.redirect(code || 302, url);
        },
        send(data: unknown): void {
          res.send(data);
        },
      };
    },

    createMiddleware(handler: (req: any, res: any, next: any) => void | Promise<void>) {
      return async (req: any, res: any, next: any) => {
        try {
          await handler(req, res, next);
        } catch (error) {
          next(error);
        }
      };
    },
  };
}

/**
 * Koa Adapter
 */
export function createKoaAdapter(): FrameworkAdapter {
  return {
    name: 'koa',

    toServerRequest(ctx: any): ServerRequest {
      return {
        method: ctx.method as any,
        url: ctx.url,
        path: ctx.path,
        query: ctx.query,
        params: ctx.params || {},
        headers: ctx.headers,
        body: ctx.request.body,
        ip: ctx.ip,
        originalUrl: ctx.originalUrl,
      };
    },

    wrapServerResponse(ctx: any): ServerResponse {
      return {
        status(code: number): ServerResponse {
          ctx.status = code;
          return this;
        },
        header(name: string, value: string): ServerResponse {
          ctx.set(name, value);
          return this;
        },
        json(data: unknown): void {
          ctx.body = data;
        },
        html(content: string): void {
          ctx.type = 'html';
          ctx.body = content;
        },
        text(content: string): void {
          ctx.type = 'text';
          ctx.body = content;
        },
        redirect(url: string, code?: number): void {
          ctx.redirect(url);
          if (code) ctx.status = code;
        },
        send(data: unknown): void {
          ctx.body = data;
        },
      };
    },

    createMiddleware(handler: (ctx: any, next: any) => void | Promise<void>) {
      return async (ctx: any, next: any) => {
        await handler(ctx, next);
      };
    },
  };
}

/**
 * Fastify Adapter
 */
export function createFastifyAdapter(): FrameworkAdapter {
  return {
    name: 'fastify',

    toServerRequest(request: any): ServerRequest {
      return {
        method: request.method as any,
        url: request.url,
        path: request.routerPath || request.url.split('?')[0],
        query: request.query,
        params: request.params || {},
        headers: request.headers,
        body: request.body,
        ip: request.ip,
        originalUrl: request.url,
      };
    },

    wrapServerResponse(reply: any): ServerResponse {
      return {
        status(code: number): ServerResponse {
          reply.code(code);
          return this;
        },
        header(name: string, value: string): ServerResponse {
          reply.header(name, value);
          return this;
        },
        json(data: unknown): void {
          reply.send(data);
        },
        html(content: string): void {
          reply.type('text/html').send(content);
        },
        text(content: string): void {
          reply.type('text/plain').send(content);
        },
        redirect(url: string, code?: number): void {
          reply.redirect(code || 302, url);
        },
        send(data: unknown): void {
          reply.send(data);
        },
      };
    },

    createMiddleware(handler: (request: any, reply: any) => void | Promise<void>) {
      // Fastify uses different plugin registration
      // This would typically be used in: fastify.addHook('onRequest', middleware)
      return async (request: any, reply: any) => {
        await handler(request, reply);
      };
    },
  };
}

/**
 * Hono Adapter (lightweight edge framework)
 */
export function createHonoAdapter(): FrameworkAdapter {
  return {
    name: 'hono',

    toServerRequest(c: any): ServerRequest {
      const req = c.req;
      return {
        method: req.method as any,
        url: req.url,
        path: req.path,
        query: Object.fromEntries(new URL(req.url).searchParams),
        params: req.param() || {},
        headers: Object.fromEntries(req.raw.headers),
        body: c._parsedBody || null,
        ip: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for'),
        originalUrl: req.url,
      };
    },

    wrapServerResponse(c: any): ServerResponse {
      let statusCode = 200;
      const headers: Record<string, string> = {};

      return {
        status(code: number): ServerResponse {
          statusCode = code;
          return this;
        },
        header(name: string, value: string): ServerResponse {
          headers[name] = value;
          return this;
        },
        json(data: unknown): void {
          c.json(data, statusCode, headers);
        },
        html(content: string): void {
          c.html(content, statusCode, headers);
        },
        text(content: string): void {
          c.text(content, statusCode, headers);
        },
        redirect(url: string, code?: number): void {
          c.redirect(url, code || 302);
        },
        send(data: unknown): void {
          c.body(data, statusCode, headers);
        },
      };
    },

    createMiddleware(handler: (c: any, next: any) => void | Promise<void>) {
      return async (c: any, next: any) => {
        await handler(c, next);
      };
    },
  };
}

/**
 * Get adapter for a framework by name
 */
export function getAdapter(framework: 'express' | 'koa' | 'fastify' | 'hono'): FrameworkAdapter {
  switch (framework) {
    case 'express':
      return createExpressAdapter();
    case 'koa':
      return createKoaAdapter();
    case 'fastify':
      return createFastifyAdapter();
    case 'hono':
      return createHonoAdapter();
    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }
}
