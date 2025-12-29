# @hyperfixi/ssr-support

Server-side rendering (SSR), hydration, SEO optimization, and caching for HyperFixi applications.

## Features

- **SSR Engine**: Server-side template compilation and rendering
- **Client Hydration**: Seamless client-side initialization with state preservation
- **SEO Optimization**: Meta tags, Open Graph, Twitter Cards, JSON-LD structured data
- **Critical CSS**: JSDOM-based extraction for above-the-fold optimization
- **Multi-tier Caching**: Memory, Redis, and tiered cache implementations
- **Framework Middleware**: Express, Koa, Fastify, and Next.js support
- **Static Site Generation**: Sitemap, robots.txt, and compression support

## Installation

```bash
npm install @hyperfixi/ssr-support
```

## Quick Start

```typescript
import { HyperFixiSSREngine, renderSSR } from '@hyperfixi/ssr-support';

// Create an SSR engine
const engine = new HyperFixiSSREngine();

// Render a template
const result = await engine.render(
  '<button _="on click toggle .active">Click me</button>',
  {
    variables: { title: 'My Page' },
    seo: {
      title: 'My Page',
      description: 'A page rendered with HyperFixi SSR',
    },
  },
  {
    hydration: true,
    inlineCSS: true,
  }
);

console.log(result.html);           // Rendered HTML
console.log(result.hydrationScript); // Client hydration script
console.log(result.metaTags);        // SEO meta tags
```

## API Reference

### HyperFixiSSREngine

The main SSR engine class.

```typescript
const engine = new HyperFixiSSREngine();
```

#### Methods

##### `render(template, context, options?)`

Renders a template with SSR.

```typescript
const result = await engine.render(template, context, options);
```

**Parameters:**
- `template: string` - Template HTML with hyperscript attributes
- `context: SSRContext` - Rendering context (variables, SEO data, request info)
- `options?: SSROptions` - SSR options (hydration, caching, etc.)

**Returns:** `Promise<SSRResult>`

##### `generateHydration(data)`

Generates a client-side hydration script.

```typescript
const script = engine.generateHydration({
  components: { '#app': { id: 'app', state: {}, hyperscript: [] } },
  appState: { user: null },
  config: { debug: false },
});
```

##### `extractCriticalCSS(html, cssFiles)`

Extracts critical CSS for above-the-fold content.

```typescript
const critical = await engine.extractCriticalCSS(html, ['styles.css']);
```

##### `setCache(cache)`

Sets the cache implementation.

```typescript
import { MemorySSRCache } from '@hyperfixi/ssr-support';

engine.setCache(new MemorySSRCache({ maxSize: 100 }));
```

##### `registerComponent(component)`

Registers a component for SSR usage.

```typescript
engine.registerComponent({
  id: 'button',
  name: 'Button',
  version: '1.0.0',
  hyperscript: 'on click toggle .active',
});
```

### SSROptions

```typescript
interface SSROptions {
  hydration?: boolean;      // Enable client hydration (default: false)
  seoLevel?: 'none' | 'basic' | 'full';  // SEO optimization level
  inlineCSS?: boolean;      // Inline critical CSS (default: false)
  preloadJS?: boolean;      // Add preload hints for JS (default: false)
  target?: 'server' | 'static';  // Target environment
  cacheTTL?: number;        // Cache TTL in seconds
}
```

### SSRContext

```typescript
interface SSRContext {
  variables?: Record<string, any>;  // Template variables
  user?: {
    id?: string;
    name?: string;
    authenticated?: boolean;
  };
  request?: {
    url: string;
    method?: string;
    headers: Record<string, string>;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: 'summary' | 'summary_large_image';
  };
  performance?: {
    preload?: string[];
    prefetch?: string[];
    preconnect?: string[];
  };
}
```

## Caching

### Memory Cache

```typescript
import { MemorySSRCache } from '@hyperfixi/ssr-support';

const cache = new MemorySSRCache({
  maxSize: 100,        // Maximum cache entries
  defaultTTL: 3600,    // Default TTL in seconds
});

engine.setCache(cache);
```

### Redis Cache

```typescript
import { RedisSSRCache } from '@hyperfixi/ssr-support';

const cache = new RedisSSRCache({
  host: 'localhost',
  port: 6379,
  keyPrefix: 'ssr:',
});

engine.setCache(cache);
```

### Tiered Cache

Combines memory and Redis for optimal performance.

```typescript
import { TieredSSRCache, MemorySSRCache, RedisSSRCache } from '@hyperfixi/ssr-support';

const cache = new TieredSSRCache({
  l1: new MemorySSRCache({ maxSize: 50 }),
  l2: new RedisSSRCache({ host: 'localhost' }),
});

engine.setCache(cache);
```

## Framework Integration

### Express

```typescript
import express from 'express';
import { HyperFixiSSREngine, createExpressSSRMiddleware } from '@hyperfixi/ssr-support';

const app = express();
const engine = new HyperFixiSSREngine();

app.use(createExpressSSRMiddleware(engine, {
  templatePath: './templates',
  ssrOptions: { hydration: true },
}));
```

### Koa

```typescript
import Koa from 'koa';
import { HyperFixiSSREngine, createKoaSSRMiddleware } from '@hyperfixi/ssr-support';

const app = new Koa();
const engine = new HyperFixiSSREngine();

app.use(createKoaSSRMiddleware(engine, {
  ssrOptions: { hydration: true },
}));
```

### Fastify

```typescript
import Fastify from 'fastify';
import { HyperFixiSSREngine, createFastifySSRPlugin } from '@hyperfixi/ssr-support';

const fastify = Fastify();
const engine = new HyperFixiSSREngine();

fastify.register(createFastifySSRPlugin(engine, {
  ssrOptions: { hydration: true },
}));
```

### Next.js

```typescript
import { HyperFixiSSREngine, createNextSSRHandler } from '@hyperfixi/ssr-support';

const engine = new HyperFixiSSREngine();
const handler = createNextSSRHandler(engine);

export default handler;
```

## SEO Generation

```typescript
import { SEOGenerator } from '@hyperfixi/ssr-support';

const seo = new SEOGenerator();

const tags = seo.generateTags({
  title: 'My Page',
  description: 'A great page',
  keywords: ['hyperfixi', 'ssr'],
  openGraph: {
    title: 'My Page',
    description: 'A great page',
    image: 'https://example.com/og.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Page',
    description: 'A great page',
  },
  structuredData: [{
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'My Page',
  }],
});
```

## Static Site Generation

```typescript
import { HyperFixiStaticGenerator } from '@hyperfixi/ssr-support';

const generator = new HyperFixiStaticGenerator();

const result = await generator.generate(
  ['/', '/about', '/contact'],
  {
    outputDir: './dist',
    baseUrl: 'https://example.com',
    sitemap: true,
    robots: true,
    compression: {
      enabled: true,
      algorithms: ['gzip', 'brotli'],
    },
  }
);

console.log(result.stats);
```

## Performance Tips

1. **Enable caching** for production with appropriate TTL values
2. **Use tiered caching** (memory + Redis) for high-traffic sites
3. **Extract critical CSS** to reduce initial render blocking
4. **Preconnect** to external domains used by your page
5. **Use static generation** for pages that don't need real-time data

## License

MIT
