import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    tracker: 'src/tracker.ts',
    collector: 'src/collector.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2020',
  minify: false,
  splitting: false,
  treeshake: true,
  external: ['@hyperfixi/core'],
  banner: {
    js: '/* Analytics System for HyperFixi Applications */',
  },
});