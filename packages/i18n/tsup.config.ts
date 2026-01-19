import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/browser.ts'],
  format: ['esm', 'cjs'],
  dts: {
    compilerOptions: {
      incremental: false,
      composite: false,
    },
  },
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ['@lokascript/core', '@lokascript/ast-toolkit'],
});
