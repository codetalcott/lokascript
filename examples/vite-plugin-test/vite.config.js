import { hyperfixi } from '../../packages/vite-plugin/src/index.ts';
import path from 'path';

// Alias needed for dev mode (source imports) but not for production (dist imports)
const isDev = process.env.NODE_ENV !== 'production';

export default {
  plugins: [hyperfixi({ debug: true })],
  optimizeDeps: {
    exclude: ['hyperfixi', 'virtual:hyperfixi']
  },
  resolve: {
    alias: isDev ? {
      // Dev mode: resolve to source files (TypeScript)
      '@hyperfixi/core/parser/hybrid': path.resolve(__dirname, '../../packages/core/src/parser/hybrid')
    } : {
      // Production: resolve to built files
      '@hyperfixi/core/parser/hybrid/parser-core': path.resolve(__dirname, '../../packages/core/dist/parser/hybrid/parser-core.mjs'),
      '@hyperfixi/core/parser/hybrid/ast-types': path.resolve(__dirname, '../../packages/core/dist/parser/hybrid/ast-types.mjs'),
    }
  }
};
