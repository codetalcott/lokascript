import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

/**
 * HyperFixi Hybrid Bundle
 *
 * Mid-size bundle with minimal recursive descent parser.
 * Target: ~8-12 KB gzipped (~60-70% hyperscript coverage)
 *
 * Features:
 * - Expression parsing with operator precedence
 * - Hyperscript selector syntax: <button.primary/>
 * - Control flow: if/else/end, repeat, for
 * - Function calls: call foo()
 * - Property chains: element's style.opacity
 * - 18 commands (vs 8 in lite, 43 in full)
 */
export default {
  input: 'src/compatibility/browser-bundle-hybrid.ts',
  output: {
    file: 'dist/hyperfixi-hybrid.js',
    format: 'iife',
    name: 'hyperfixi',
    sourcemap: false
  },
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    typescript({
      tsconfig: 'tsconfig.json',
      declaration: false,
      sourceMap: false
    }),
    ...(process.env.NO_TERSER ? [] : [terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        passes: 3,
        dead_code: true,
        conditionals: true,
        evaluate: true,
        unused: true,
        drop_debugger: true,
        drop_console: false,
        toplevel: true,
        ecma: 2020
      },
      mangle: {
        toplevel: true,
        properties: {
          regex: /^_/  // Mangle private properties
        }
      },
      format: {
        comments: false,
        ecma: 2020
      }
    })])
  ]
};
