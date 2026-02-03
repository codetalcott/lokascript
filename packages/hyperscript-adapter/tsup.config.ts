import { defineConfig } from 'tsup';

// Shared IIFE config for browser bundles
const iife = (
  entry: Record<string, string>,
  globalName: string,
  treeshake = true,
) => ({
  entry,
  format: ['iife'] as const,
  globalName,
  minify: true,
  sourcemap: true,
  treeshake,
  esbuildOptions(options: Record<string, unknown>) {
    options.treeShaking = treeshake;
  },
});

export default defineConfig([
  // -------------------------------------------------------------------------
  // Node.js library (ESM + CJS)
  // -------------------------------------------------------------------------
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
  },

  // -------------------------------------------------------------------------
  // Full bundle — all 24 languages (~530 KB)
  // -------------------------------------------------------------------------
  iife(
    { 'hyperscript-i18n': 'src/browser.ts' },
    'HyperscriptI18n',
    false, // don't tree-shake: need all language side-effects
  ),

  // -------------------------------------------------------------------------
  // Lite adapter — no semantic bundled, expects external global (~4 KB)
  // -------------------------------------------------------------------------
  iife(
    { 'hyperscript-i18n-lite': 'src/browser-lite.ts' },
    'HyperscriptI18n',
  ),

  // -------------------------------------------------------------------------
  // Single-language bundles (en + target)
  // -------------------------------------------------------------------------
  iife({ 'hyperscript-i18n-es': 'src/bundles/es.ts' }, 'HyperscriptI18n'),
  iife({ 'hyperscript-i18n-ja': 'src/bundles/ja.ts' }, 'HyperscriptI18n'),
  iife({ 'hyperscript-i18n-ko': 'src/bundles/ko.ts' }, 'HyperscriptI18n'),
  iife({ 'hyperscript-i18n-zh': 'src/bundles/zh.ts' }, 'HyperscriptI18n'),
  iife({ 'hyperscript-i18n-fr': 'src/bundles/fr.ts' }, 'HyperscriptI18n'),
  iife({ 'hyperscript-i18n-de': 'src/bundles/de.ts' }, 'HyperscriptI18n'),
  iife({ 'hyperscript-i18n-pt': 'src/bundles/pt.ts' }, 'HyperscriptI18n'),
  iife({ 'hyperscript-i18n-ar': 'src/bundles/ar.ts' }, 'HyperscriptI18n'),
  iife({ 'hyperscript-i18n-tr': 'src/bundles/tr.ts' }, 'HyperscriptI18n'),
  iife({ 'hyperscript-i18n-id': 'src/bundles/id.ts' }, 'HyperscriptI18n'),

  // -------------------------------------------------------------------------
  // Regional bundles
  // -------------------------------------------------------------------------
  iife({ 'hyperscript-i18n-western': 'src/bundles/western.ts' }, 'HyperscriptI18n'),
  iife({ 'hyperscript-i18n-east-asian': 'src/bundles/east-asian.ts' }, 'HyperscriptI18n'),
]);
