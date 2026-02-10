# Framework Support for Server-Side Hyperscript

The request event source is **framework-agnostic** with built-in adapters for popular server frameworks.

## Supported Frameworks

### ✅ Express

```typescript
import express from 'express';
import { setupExpressHyperscriptRoutes } from '@lokascript/server-integration/middleware/express';

const app = express();
app.use(express.json());

await setupExpressHyperscriptRoutes(app, { debug: true });
```

### ✅ Koa

```typescript
import Koa from 'koa';
import { createHyperscriptMiddleware, createKoaAdapter } from '@lokascript/server-integration';

const app = new Koa();

const middleware = createHyperscriptMiddleware({
  adapter: createKoaAdapter(),
  debug: true,
});

app.use(middleware);
```

### ✅ Fastify

```typescript
import Fastify from 'fastify';
import { createHyperscriptMiddleware, createFastifyAdapter } from '@lokascript/server-integration';

const fastify = Fastify();

const middleware = createHyperscriptMiddleware({
  adapter: createFastifyAdapter(),
  debug: true,
});

// Fastify uses hooks instead of middleware
fastify.addHook('onRequest', middleware);
```

### ✅ Hono (Edge/Workers)

```typescript
import { Hono } from 'hono';
import { createHyperscriptMiddleware, createHonoAdapter } from '@lokascript/server-integration';

const app = new Hono();

const middleware = createHyperscriptMiddleware({
  adapter: createHonoAdapter(),
  debug: true,
});

app.use('*', middleware);
```

## Framework-Agnostic API

All frameworks use the same core API:

```typescript
import { createHyperscriptMiddleware } from '@lokascript/server-integration';
import { getAdapter } from '@lokascript/server-integration/adapters';

const middleware = createHyperscriptMiddleware({
  adapter: getAdapter('express'), // or 'koa', 'fastify', 'hono'
  debug: true,
  alwaysCallNext: false,
  onError: (error, req, res) => {
    console.error('Route error:', error);
  },
});
```

## Creating Custom Adapters

Want to support a different framework? Implement the `FrameworkAdapter` interface:

```typescript
import type {
  FrameworkAdapter,
  ServerRequest,
  ServerResponse,
} from '@lokascript/server-integration';

export function createMyFrameworkAdapter(): FrameworkAdapter {
  return {
    name: 'my-framework',

    toServerRequest(req): ServerRequest {
      return {
        method: req.method,
        url: req.url,
        path: req.path,
        query: req.query,
        params: req.params,
        headers: req.headers,
        body: req.body,
      };
    },

    wrapServerResponse(res): ServerResponse {
      return {
        status(code: number) {
          res.statusCode = code;
          return this;
        },
        header(name: string, value: string) {
          res.setHeader(name, value);
          return this;
        },
        json(data: unknown) {
          res.json(data);
        },
        html(content: string) {
          res.send(content);
        },
        text(content: string) {
          res.send(content);
        },
        redirect(url: string, code?: number) {
          res.redirect(code || 302, url);
        },
        send(data: unknown) {
          res.send(data);
        },
      };
    },

    createMiddleware(handler) {
      return async (req, res, next) => {
        await handler(req, res, next);
      };
    },
  };
}

// Use it
const middleware = createHyperscriptMiddleware({
  adapter: createMyFrameworkAdapter(),
});
```

## Adapter Design Principles

Each adapter must:

1. **Convert requests** - Transform framework-specific request → generic `ServerRequest`
2. **Wrap responses** - Wrap framework-specific response → generic `ServerResponse`
3. **Create middleware** - Return framework-compatible middleware function
4. **Handle errors** - Properly integrate with framework error handling

## Why Framework-Agnostic?

- ✅ **No lock-in** - Works with any Node.js framework
- ✅ **Edge support** - Works in Cloudflare Workers, Deno Deploy, etc.
- ✅ **Future-proof** - New frameworks? Just add an adapter
- ✅ **Testable** - Core logic separate from framework details
- ✅ **Maintainable** - Changes don't require framework-specific code

## Framework Comparison

| Framework | Middleware Style | Edge Support | Adapter Complexity            |
| --------- | ---------------- | ------------ | ----------------------------- |
| Express   | `app.use()`      | ❌ No        | ⭐ Simple                     |
| Koa       | `app.use()`      | ❌ No        | ⭐⭐ Moderate (context-based) |
| Fastify   | `addHook()`      | ❌ No        | ⭐⭐ Moderate (hooks)         |
| Hono      | `app.use()`      | ✅ Yes       | ⭐ Simple                     |

## Next Steps

Want to add support for your framework? Open an issue or submit a PR with your adapter!

Adapters we'd love to see:

- [ ] Elysia (Bun)
- [ ] H3 (Nitro/Nuxt)
- [ ] tRPC
- [ ] Nest.js
- [ ] Remix
