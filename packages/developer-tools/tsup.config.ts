import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    analyzer: 'src/analyzer.ts',
    builder: 'src/builder.ts',
    generator: 'src/generator.ts',
    'dev-server': 'src/dev-server.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2020',
  minify: false,
  splitting: false,
  treeshake: true,
  external: [
    '@hyperfixi/core',
    'commander',
    'inquirer',
    'chalk',
    'ora',
    'boxen',
    'semver',
    'fs-extra',
    'glob',
    'chokidar',
    'express',
    'ws',
    'open',
    'http-proxy-middleware',
    'compression',
  ],
  banner: {
    js: '/* HyperFixi Developer Tools */\n#!/usr/bin/env node',
  },
  // Make CLI executable
  onSuccess: async () => {
    const fs = require('fs');
    const path = require('path');
    
    // Make CLI files executable
    const cliFiles = ['dist/cli.js', 'dist/cli.mjs'];
    
    for (const file of cliFiles) {
      if (fs.existsSync(file)) {
        fs.chmodSync(file, 0o755);
      }
    }
  },
});