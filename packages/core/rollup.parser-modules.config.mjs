/**
 * Rollup config for building modular parser components
 *
 * These modules are used by the vite-plugin's bundle generator
 * to create minimal, tree-shakeable bundles.
 */

import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const parserModules = [
  'parser/hybrid-parser',
  'parser/hybrid/parser-core',
  'parser/hybrid/ast-types',
  'parser/hybrid/tokenizer',
  'parser/hybrid/aliases',
  'parser/hybrid/index',
];

export default parserModules.map(module => ({
  input: `src/${module}.ts`,
  output: [
    {
      file: `dist/${module}.mjs`,
      format: 'es',
      sourcemap: true,
    },
    {
      file: `dist/${module}.js`,
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: './tsconfig.build.json',
      declaration: false,  // Declarations are built separately
      compilerOptions: {
        emitDeclarationOnly: false,
        declarationDir: undefined,
      },
    }),
  ],
  external: [],
}));
