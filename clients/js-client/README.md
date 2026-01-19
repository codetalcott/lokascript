# LokaScript JavaScript/TypeScript Client

A comprehensive JavaScript/TypeScript client library for [LokaScript](https://github.com/lokascript/lokascript) server-side hyperscript compilation, with native Express.js and ElysiaJS integration and full TypeScript support.

## Features

- **HTTP Client** with automatic retry logic and comprehensive error handling
- **Express Middleware** for automatic hyperscript compilation in HTML responses
- **ElysiaJS Plugin** for modern Bun-based server integration with full type safety
- **Template Helpers** for server-side rendering with hyperscript support
- **TypeScript Support** with complete type definitions and strict typing
- **Template Variables** with `{{variable}}` substitution support
- **Error Handling** with custom error classes and detailed error information
- **Modular Architecture** with tree-shakable exports and optional framework integration

## Installation

```bash
npm install @lokascript/client
# or
yarn add @lokascript/client
# or
pnpm add @lokascript/client
```

For Express integration:

```bash
npm install @lokascript/client express
```

For ElysiaJS integration:

```bash
npm install @lokascript/client elysia
```

## Quick Start

### Basic Client Usage

```typescript
import { createClient } from '@lokascript/client';

// Create client with default configuration
const client = createClient();

// Compile hyperscript
const result = await client.compile({
  scripts: {
    button: 'on click toggle .active',
    form: 'on submit fetch /api/save then put result into #status',
  },
  options: {
    minify: true,
    compatibility: 'modern',
  },
});

console.log('Compiled JavaScript:', result.compiled.button);
console.log('Events detected:', result.metadata.button.events);
```

### Custom Client Configuration

```typescript
import { createClient, ClientConfig } from '@lokascript/client';

const config: ClientConfig = {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  retries: 3,
  authToken: 'your-auth-token',
  headers: {
    'X-Custom-Header': 'value',
  },
};

const client = createClient(config);
```

## Express.js Integration

### Middleware Setup

```typescript
import express from 'express';
import {
  createClient,
  lokascriptMiddleware,
  createMiddlewareConfig,
} from '@lokascript/client/express';

const app = express();

// Create LokaScript client
const client = createClient({ baseURL: 'http://localhost:3000' });

// Add LokaScript middleware
const config = createMiddlewareConfig(client);
app.use(lokascriptMiddleware(config));

// Your routes will automatically compile hyperscript
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <body>
      <!-- This hyperscript will be automatically compiled -->
      <button _="on click toggle .active">Toggle Active</button>
      
      <!-- This will also be compiled -->
      <form data-hs="on submit fetch /api/save then put result into #status">
        <input type="text" name="message">
        <button type="submit">Save</button>
      </form>
      
      <div id="status"></div>
    </body>
    </html>
  `);
});

app.listen(3000);
```

## ElysiaJS Integration

### Plugin Setup

```typescript
import { Elysia } from 'elysia';
import { createClient, lokascriptPlugin, createElysiaConfig } from '@lokascript/client/elysia';

// Create LokaScript client
const client = createClient({ baseURL: 'http://localhost:3000' });

// Create and use LokaScript plugin
const app = new Elysia()
  .use(
    lokascriptPlugin({
      client,
      compileOnResponse: true,
      compilationOptions: {
        minify: true,
        compatibility: 'modern',
      },
      skipPaths: ['/api/', '/static/'],
      basePath: '/hyperscript',
    })
  )
  .get(
    '/',
    () => `
    <!DOCTYPE html>
    <html>
    <body>
      <!-- This hyperscript will be automatically compiled -->
      <button _="on click toggle .active">Toggle Active</button>
      
      <!-- This will also be compiled -->
      <form data-hs="on submit fetch /api/save then put result into #status">
        <input type="text" name="message">
        <button type="submit">Save</button>
      </form>
      
      <div id="status"></div>
    </body>
    </html>
  `
  )
  .listen(3000);

console.log('🦊 Elysia is running at http://localhost:3000');
```

### Advanced ElysiaJS Configuration

```typescript
import { lokascriptPlugin, ElysiaPluginConfig } from '@lokascript/client/elysia';

const config: ElysiaPluginConfig = {
  client,
  compileOnResponse: true,
  templateVarsHeader: 'x-hyperscript-template-vars',
  compilationOptions: {
    minify: true,
    compatibility: 'modern',
    sourceMap: false,
  },
  skipPaths: ['/api/', '/static/', '/assets/'],
  onlyContentTypes: ['text/html', 'application/xhtml+xml'],
  basePath: '/hyperscript',
  errorHandler: (context, error) => {
    console.error('LokaScript ElysiaJS plugin error:', error);
    // Custom error handling logic
  },
};

const app = new Elysia().use(lokascriptPlugin(config));
```

### Template Variables with ElysiaJS

```typescript
import { getTemplateVars, getElysiaHyperfixiClient } from '@lokascript/client/elysia';

const app = new Elysia().use(lokascriptPlugin({ client })).get('/user/:id', ({ params, set }) => {
  // Set template variables via header
  set.headers['x-hyperscript-template-vars'] = JSON.stringify({
    userId: params.id,
  });

  return `
      <!DOCTYPE html>
      <html>
      <body>
        <h1>User Profile</h1>
        <!-- Template variables will be substituted before compilation -->
        <button _="on click fetch /api/users/{{userId}} then put result into #profile">
          Load Profile
        </button>
        <div id="profile"></div>
      </body>
      </html>
    `;
});
```

### ElysiaJS Template Helpers

```typescript
import { createElysiaTemplateHelpers } from '@lokascript/client/elysia';

// Create template helpers
const helpers = createElysiaTemplateHelpers(client);

const app = new Elysia()
  .use(lokascriptPlugin({ client }))
  .get('/interactive', async ({ params }) => {
    const userId = params.id;

    // Compile hyperscript with template variables
    const onclickAttr = await helpers.compileHyperscript(
      'on click fetch /api/users/{{userId}} then put result into #profile',
      { userId }
    );

    return `
      <button ${onclickAttr}>Load User Profile</button>
      <div id="profile"></div>
    `;
  })
  .get('/custom-compile', async ({ request }) => {
    const client = getElysiaHyperfixiClient({ request } as any);

    if (!client) {
      return new Response(JSON.stringify({ error: 'LokaScript client not available' }), {
        status: 500,
      });
    }

    try {
      const result = await client.compileScript('on click log "Custom compilation"');
      return { compiled: result.compiled };
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  });
```

### Standalone ElysiaJS API App

```typescript
import { createHyperfixiApp } from '@lokascript/client/elysia';

// Create standalone app with LokaScript API routes only
const api = createHyperfixiApp(client, '/hyperscript');

// This creates the following endpoints:
// POST /hyperscript/compile
// POST /hyperscript/validate
// POST /hyperscript/batch
// GET  /hyperscript/health
// GET  /hyperscript/cache/stats
// POST /hyperscript/cache/clear

api.listen(3001);
```

### Advanced Middleware Configuration

```typescript
import { lokascriptMiddleware, ExpressMiddlewareConfig } from '@lokascript/client/express';

const config: ExpressMiddlewareConfig = {
  client,
  compileOnResponse: true,
  templateVarsHeader: 'X-Hyperscript-Template-Vars',
  compilationOptions: {
    minify: true,
    compatibility: 'modern',
    sourceMap: false,
  },
  skipPaths: ['/api/', '/static/', '/assets/'],
  onlyContentTypes: ['text/html', 'application/xhtml+xml'],
  errorHandler: (req, res, error) => {
    console.error('LokaScript middleware error:', error);
    // Custom error handling logic
  },
};

app.use(lokascriptMiddleware(config));
```

### Template Variables with Express

```typescript
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;

  // Set template variables via header
  res.set('X-Hyperscript-Template-Vars', JSON.stringify({ userId }));

  res.send(`
    <!DOCTYPE html>
    <html>
    <body>
      <h1>User Profile</h1>
      <!-- Template variables will be substituted before compilation -->
      <button _="on click fetch /api/users/{{userId}} then put result into #profile">
        Load Profile
      </button>
      <div id="profile"></div>
    </body>
    </html>
  `);
});
```

### Template Helpers

```typescript
import { createTemplateHelpers, getHyperfixiClient } from '@lokascript/client/express';

// Create template helpers
const helpers = createTemplateHelpers(client);

// In your route handler
app.get('/interactive', async (req, res) => {
  const userId = req.params.id;

  // Compile hyperscript with template variables
  const onclickAttr = await helpers.compileHyperscript(
    'on click fetch /api/users/{{userId}} then put result into #profile',
    { userId }
  );

  res.send(`
    <button ${onclickAttr}>Load User Profile</button>
    <div id="profile"></div>
  `);
});

// Using client from middleware context
app.get('/custom-compile', async (req, res) => {
  const client = getHyperfixiClient(req);

  if (!client) {
    return res.status(500).json({ error: 'LokaScript client not available' });
  }

  try {
    const result = await client.compileScript('on click log "Custom compilation"');
    res.json({ compiled: result.compiled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### API Routes

```typescript
import { createApiRoutes } from '@lokascript/client/express';

// Add LokaScript API routes to your Express app
const apiRoutes = createApiRoutes(client, '/hyperscript');
app.use(apiRoutes);

// This creates the following endpoints:
// POST /hyperscript/compile
// POST /hyperscript/validate
// POST /hyperscript/batch
// GET  /hyperscript/health
// GET  /hyperscript/cache/stats
// POST /hyperscript/cache/clear
```

## API Reference

### Client Methods

#### Core Compilation

```typescript
// Compile multiple scripts
await client.compile({
  scripts: {
    button: 'on click toggle .active',
    form: 'on submit fetch /api/save',
  },
  options: { minify: true },
  context: { templateVars: { userId: 123 } },
});

// Compile single script
const { compiled, metadata } = await client.compileScript('on click toggle .active', {
  minify: true,
});

// Compile with template variables
await client.compileWithTemplateVars(
  { button: 'on click fetch /api/users/{{userId}}' },
  { userId: 123 },
  { minify: true }
);
```

#### Validation

```typescript
// Validate multiple aspects
const result = await client.validate({
  script: 'on click toggle .active',
  context: { templateVars: { userId: 123 } },
});

// Simple validation
const { valid, errors } = await client.validateScript('on click toggle .active');
```

#### Batch Processing

```typescript
await client.batchCompile({
  definitions: [
    {
      id: 'navigation',
      script: 'on click add .active to me then remove .active from siblings',
      options: { minify: true },
    },
    {
      id: 'modal',
      script: 'on click toggle .modal-open on body',
      context: { templateVars: { modalId: 'main-modal' } },
    },
  ],
});
```

#### Service Management

```typescript
// Check service health
const health = await client.health();
console.log(`Service: ${health.status}, Version: ${health.version}`);

// Get cache statistics
const stats = await client.cacheStats();
console.log(`Cache hit ratio: ${(stats.hitRatio * 100).toFixed(1)}%`);

// Clear compilation cache
await client.clearCache();
```

### TypeScript Types

```typescript
import type {
  ClientConfig,
  CompileRequest,
  CompileResponse,
  CompilationOptions,
  ScriptMetadata,
  ParseContext,
  CompatibilityMode,
  HyperfixiError
} from '@lokascript/client';

// Configuration
const config: ClientConfig = {
  baseURL: string;
  timeout?: number;
  retries?: number;
  authToken?: string;
  headers?: Record<string, string>;
};

// Compilation options
const options: CompilationOptions = {
  minify?: boolean;
  compatibility?: 'modern' | 'legacy';
  sourceMap?: boolean;
  optimization?: boolean;
  templateVars?: Record<string, any>;
};

// Script metadata
const metadata: ScriptMetadata = {
  complexity: number;
  dependencies: string[];
  selectors: string[];
  events: string[];
  commands: string[];
  templateVariables: string[];
};
```

## Error Handling

### Error Types

```typescript
import {
  HyperfixiError,
  NetworkError,
  ValidationError,
  CompilationFailedError,
} from '@lokascript/client';

try {
  const result = await client.compile({ scripts: { test: 'invalid script' } });
} catch (error) {
  if (error instanceof CompilationFailedError) {
    console.log('Compilation errors:', error.errors);
    for (const compileError of error.errors) {
      console.log(`Line ${compileError.line}: ${compileError.message}`);
    }
  } else if (error instanceof ValidationError) {
    console.log('Validation error:', error.message);
  } else if (error instanceof NetworkError) {
    console.log('Network error:', error.message);
  } else if (error instanceof HyperfixiError) {
    console.log(`Service error (${error.statusCode}): ${error.message}`);
  }
}
```

### Error Handling in Express

```typescript
const config: ExpressMiddlewareConfig = {
  client,
  errorHandler: (req, res, error) => {
    if (error instanceof HyperfixiError) {
      console.error(`LokaScript error (${error.statusCode}):`, error.message);
    } else {
      console.error('Unexpected error:', error.message);
    }

    // Optionally send error response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'HyperScript compilation failed',
        details: error.message,
      });
    }
  },
};
```

## Template Variables

Template variables use `{{variable}}` syntax and are processed before compilation:

```typescript
// Variables are substituted before hyperscript compilation
const templateVars = {
  userId: 123,
  apiEndpoint: '/api/v1',
  className: 'btn-primary',
  timeout: 5000,
};

const result = await client.compileWithTemplateVars(
  {
    button:
      'on click fetch {{apiEndpoint}}/users/{{userId}} then add .{{className}} wait {{timeout}}ms',
  },
  templateVars
);

// Results in compilation of:
// "on click fetch /api/v1/users/123 then add .btn-primary wait 5000ms"
```

### Express Template Variables

```typescript
// Set via header (recommended)
app.get('/user/:id', (req, res) => {
  res.set(
    'X-Hyperscript-Template-Vars',
    JSON.stringify({
      userId: req.params.id,
      apiUrl: process.env.API_URL,
    })
  );

  res.send(htmlWithHyperScript);
});

// Access in middleware
app.use((req, res, next) => {
  const vars = getTemplateVars(req);
  if (vars) {
    console.log('Template variables:', vars);
  }
  next();
});
```

## Advanced Usage

### Custom HTTP Client Configuration

```typescript
import axios from 'axios';
import { Client } from '@lokascript/client';

// Create custom axios instance
const httpClient = axios.create({
  baseURL: 'https://lokascript.example.com',
  timeout: 60000,
  headers: {
    'User-Agent': 'MyApp/1.0.0',
    Accept: 'application/json',
  },
});

// Add request interceptor
httpClient.interceptors.request.use(config => {
  config.headers['X-Request-ID'] = generateRequestId();
  return config;
});

const client = new Client({
  baseURL: 'https://lokascript.example.com',
  timeout: 60000,
  retries: 5,
  headers: {
    'User-Agent': 'MyApp/1.0.0',
  },
});
```

### Streaming and Large Payloads

```typescript
// For large batch compilations
const largeDefinitions = generateManyScriptDefinitions(); // 1000+ scripts

try {
  const result = await client.batchCompile({
    definitions: largeDefinitions,
  });

  console.log(`Compiled ${Object.keys(result.compiled).length} scripts`);
  console.log(`Total time: ${result.timings.total}ms`);
} catch (error) {
  if (error instanceof CompilationFailedError) {
    console.log(`${error.errors.length} compilation errors occurred`);
  }
}
```

### Performance Monitoring

```typescript
// Monitor compilation performance
const startTime = Date.now();

const result = await client.compile({
  scripts: myScripts,
  options: { minify: true },
});

const totalTime = Date.now() - startTime;
console.log('Client timing:', {
  total: totalTime,
  server: result.timings.total,
  network: totalTime - result.timings.total,
});

// Monitor cache effectiveness
const stats = await client.cacheStats();
console.log('Cache performance:', {
  hitRatio: (stats.hitRatio * 100).toFixed(1) + '%',
  utilization: ((stats.size / stats.maxSize) * 100).toFixed(1) + '%',
});
```

## Testing

### Unit Testing with Vitest

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@lokascript/client';

describe('LokaScript Client', () => {
  it('should compile scripts successfully', async () => {
    const client = createClient({
      baseURL: 'http://localhost:3000',
    });

    const result = await client.compile({
      scripts: {
        test: 'on click toggle .active',
      },
    });

    expect(result.compiled.test).toContain('addEventListener');
    expect(result.metadata.test.events).toContain('click');
  });
});
```

### Integration Testing with Express

```typescript
import request from 'supertest';
import express from 'express';
import {
  createClient,
  lokascriptMiddleware,
  createMiddlewareConfig,
} from '@lokascript/client/express';

describe('Express Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    const client = createClient({ baseURL: 'http://localhost:3000' });
    const config = createMiddlewareConfig(client);
    app.use(lokascriptMiddleware(config));
  });

  it('should compile hyperscript in HTML responses', async () => {
    app.get('/test', (req, res) => {
      res.send('<button _="on click toggle .active">Test</button>');
    });

    const response = await request(app).get('/test');

    expect(response.text).toContain('onclick=');
    expect(response.text).not.toContain('_=');
  });
});
```

## Examples

### Complete Express Application

```typescript
import express from 'express';
import {
  createClient,
  lokascriptMiddleware,
  createApiRoutes,
  createTemplateHelpers,
} from '@lokascript/client/express';

const app = express();
const client = createClient({ baseURL: 'http://localhost:3000' });

// Add middleware
app.use(
  lokascriptMiddleware({
    client,
    compilationOptions: { minify: true },
    skipPaths: ['/api/', '/static/'],
  })
);

// Add API routes
app.use(createApiRoutes(client));

// Template helpers
const helpers = createTemplateHelpers(client);

// Main page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>LokaScript Demo</title></head>
    <body>
      <h1>Interactive Elements</h1>
      
      <!-- Auto-compiled by middleware -->
      <button _="on click toggle .highlighted">Toggle Highlight</button>
      
      <form data-hs="on submit fetch /api/save then put result into #result">
        <input name="message" placeholder="Enter message">
        <button type="submit">Save</button>
      </form>
      
      <div id="result"></div>
    </body>
    </html>
  `);
});

// Dynamic compilation
app.get('/user/:id', async (req, res) => {
  const userId = req.params.id;

  const loadButtonAttr = await helpers.compileHyperscript(
    'on click fetch /api/users/{{userId}} then put result into #profile',
    { userId }
  );

  res.send(`
    <div>
      <h2>User ${userId}</h2>
      <button ${loadButtonAttr}>Load Profile</button>
      <div id="profile"></div>
    </div>
  `);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Build the package: `npm run build`
6. Submit a pull request

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

## Building

```bash
# Build for production
npm run build

# Build in watch mode
npm run build:watch
```

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: [https://lokascript.dev/docs](https://lokascript.dev/docs)
- **Issues**: [GitHub Issues](https://github.com/lokascript/lokascript/issues)
- **NPM Package**: [npmjs.com/package/@lokascript/client](https://www.npmjs.com/package/@lokascript/client)
