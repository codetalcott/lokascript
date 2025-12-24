/**
 * HyperFixi Patterns Browser
 *
 * A hypermedia-driven patterns reference browser built with Bun + Elysia + hyperfixi.
 */

import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';
import { staticPlugin } from '@elysiajs/static';
import { resolve } from 'path';

import { indexRoutes } from './routes/index';
import { patternsRoutes } from './routes/patterns';
import { translationsRoutes } from './routes/translations';
import { llmRoutes } from './routes/llm';
import { statsRoutes } from './routes/stats';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Resolve paths
const publicDir = resolve(import.meta.dir, '../public');
const stylesDir = resolve(import.meta.dir, 'styles');
const coreDistDir = resolve(import.meta.dir, '../../../packages/core/dist');

const app = new Elysia()
  // HTML plugin for JSX support
  .use(html())

  // Static files
  .use(
    staticPlugin({
      prefix: '/public',
      assets: publicDir,
    })
  )

  // Serve styles directly
  .get('/public/theme.css', () => Bun.file(resolve(stylesDir, 'theme.css')))

  // Serve hyperfixi from core package
  .get('/public/hyperfixi-browser.js', () =>
    Bun.file(resolve(coreDistDir, 'hyperfixi-browser.js'))
  )

  // Routes
  .use(indexRoutes)
  .use(patternsRoutes)
  .use(translationsRoutes)
  .use(llmRoutes)
  .use(statsRoutes)

  // Error handling
  .onError(({ code, error }) => {
    console.error(`Error [${code}]:`, error);
    const message = error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : String(error);
    return {
      error: code,
      message,
    };
  })

  .listen(PORT);

console.log(`
  HyperFixi Patterns Browser

  Local:   http://localhost:${app.server?.port}
  Network: http://${app.server?.hostname}:${app.server?.port}

  Press Ctrl+C to stop
`);

export type App = typeof app;
