import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const external = ['@hyperfixi/core', 'fs/promises', 'path'];

export default [
  // ESM build
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'dist/index.mjs',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist'
      })
    ]
  },
  // CJS build
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  },
  // Browser bundle (minified)
  {
    input: 'src/bundles/standard.ts',
    output: {
      file: 'dist/hyperfixi-plugins.min.js',
      format: 'iife',
      name: 'HyperfixiPlugins',
      sourcemap: true
    },
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json'
      }),
      terser()
    ]
  }
];
