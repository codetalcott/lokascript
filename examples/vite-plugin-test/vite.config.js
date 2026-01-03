import { hyperfixi } from '../../packages/vite-plugin/src/index.ts';
import path from 'path';

export default {
  plugins: [hyperfixi({ debug: true })],
  optimizeDeps: {
    exclude: ['hyperfixi', 'virtual:hyperfixi']
  },
  resolve: {
    alias: {
      '@hyperfixi/core/parser/hybrid': path.resolve(__dirname, '../../packages/core/src/parser/hybrid')
    }
  }
};
