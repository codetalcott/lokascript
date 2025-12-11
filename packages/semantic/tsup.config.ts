import { defineConfig } from 'tsup';

export default defineConfig([
  // Node.js builds (CJS + ESM)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['@hyperfixi/i18n'],
  },
  // Browser bundle (IIFE) - output: hyperfixi-semantic.browser.global.js
  {
    entry: ['src/browser.ts'],
    outDir: 'dist',
    format: ['iife'],
    globalName: 'HyperFixiSemantic',
    minify: true,
    sourcemap: true,
    platform: 'browser',
    noExternal: ['@hyperfixi/i18n'],
    // Use custom output name
    outExtension() {
      return { js: '.global.js' };
    },
    esbuildOptions(options) {
      // Ensure browser-compatible output
      options.target = 'es2020';
    },
  },
]);
