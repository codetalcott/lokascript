import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.mjs', // ES module output
      format: 'es',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/index.js', // CommonJS output
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/index.min.js', // Minified UMD for browser
      format: 'umd',
      name: 'HyperFixiCore',
      plugins: [terser()],
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  plugins: [nodeResolve(), typescript()],
  external: [] // No external dependencies for core
};