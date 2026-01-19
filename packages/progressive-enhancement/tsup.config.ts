import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    detector: 'src/detector.ts',
    enhancer: 'src/enhancer.ts',
    levels: 'src/levels.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2020',
  minify: false,
  splitting: false,
  treeshake: true,
  external: ['@lokascript/core'],
  banner: {
    js: '/* Progressive Enhancement for HyperFixi Applications */',
  },
});