/**
 * @hyperfixi/vite-plugin
 *
 * Zero-config Vite plugin that automatically generates minimal HyperFixi bundles
 * based on detected hyperscript usage in your source files.
 *
 * @example
 * ```javascript
 * // vite.config.js
 * import { hyperfixi } from '@hyperfixi/vite-plugin';
 *
 * export default {
 *   plugins: [hyperfixi()]
 * };
 * ```
 *
 * The plugin automatically:
 * - Scans HTML, Vue, Svelte, JSX/TSX files for `_="..."` attributes
 * - Detects which commands, blocks, and expressions are used
 * - Generates a minimal bundle with only needed features
 * - Re-generates on file changes (HMR)
 *
 * @example
 * ```javascript
 * // With options
 * hyperfixi({
 *   extraCommands: ['fetch', 'put'],  // Always include these commands
 *   htmx: true,                       // Enable htmx integration
 *   debug: true,                      // Enable verbose logging
 * })
 * ```
 */

import type { Plugin, ViteDevServer, HmrContext } from 'vite';
import type { HyperfixiPluginOptions, AggregatedUsage } from './types';
import { Scanner } from './scanner';
import { Aggregator } from './aggregator';
import { Generator } from './generator';

// Re-export types
export type { HyperfixiPluginOptions, FileUsage, AggregatedUsage } from './types';

// Virtual module ID
const VIRTUAL_MODULE_ID = 'virtual:hyperfixi';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

// Import aliases that resolve to the virtual module
const IMPORT_ALIASES = ['hyperfixi', '@hyperfixi/core', 'virtual:hyperfixi'];

/**
 * Create the HyperFixi Vite plugin
 *
 * @param options Plugin options
 * @returns Vite plugin
 */
export function hyperfixi(options: HyperfixiPluginOptions = {}): Plugin {
  const scanner = new Scanner(options);
  const aggregator = new Aggregator();
  const generator = new Generator(options);

  let server: ViteDevServer | null = null;
  let cachedBundle: string | null = null;
  let lastUsageHash = '';
  let isDev = false;

  /**
   * Compute a hash of the current usage for cache invalidation
   */
  function computeUsageHash(usage: AggregatedUsage): string {
    const commands = [...usage.commands].sort().join(',');
    const blocks = [...usage.blocks].sort().join(',');
    return `${commands}|${blocks}|${usage.positional}`;
  }

  /**
   * Invalidate the virtual module in dev server
   */
  function invalidateVirtualModule(): void {
    if (!server) return;

    const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
    if (mod) {
      server.moduleGraph.invalidateModule(mod);
      server.ws.send({ type: 'full-reload' });

      if (options.debug) {
        console.log('[hyperfixi] Virtual module invalidated, triggering reload');
      }
    }
  }

  /**
   * Generate the bundle code
   */
  function generateBundle(): string {
    const usage = aggregator.getUsage();
    const usageHash = computeUsageHash(usage);

    // Return cached bundle if usage hasn't changed
    if (cachedBundle && usageHash === lastUsageHash) {
      return cachedBundle;
    }

    // In dev mode, optionally use fallback bundle for faster rebuilds
    if (isDev && options.devFallback && options.devFallback !== 'auto') {
      cachedBundle = generator.generateDevFallback(options.devFallback);
    } else {
      cachedBundle = generator.generate(usage, options);
    }

    lastUsageHash = usageHash;

    if (options.debug) {
      const summary = aggregator.getSummary();
      console.log('[hyperfixi] Bundle generated:', summary);
    }

    return cachedBundle;
  }

  return {
    name: 'vite-plugin-hyperfixi',
    enforce: 'pre' as const,

    /**
     * Configure plugin based on Vite mode
     */
    configResolved(config) {
      isDev = config.command === 'serve';

      if (options.debug) {
        console.log('[hyperfixi] Plugin initialized, mode:', isDev ? 'development' : 'production');
      }
    },

    /**
     * Store server reference and pre-scan HTML files for HMR
     */
    async configureServer(_server: ViteDevServer) {
      server = _server;

      // Pre-scan project to detect hyperscript before first request
      const cwd = _server.config.root;
      if (options.debug) {
        console.log('[hyperfixi] Pre-scanning project:', cwd);
      }

      const scannedFiles = await scanner.scanProject(cwd);
      aggregator.loadFromScan(scannedFiles);

      if (options.debug) {
        const summary = aggregator.getSummary();
        console.log('[hyperfixi] Pre-scan complete:', summary);
      }
    },

    /**
     * Resolve virtual module imports
     */
    resolveId(id: string) {
      if (IMPORT_ALIASES.includes(id)) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
      return null;
    },

    /**
     * Load the virtual module with generated bundle
     */
    load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return generateBundle();
      }
      return null;
    },

    /**
     * Scan files during transform for hyperscript usage
     */
    transform(code: string, id: string) {
      if (!scanner.shouldScan(id)) {
        return null;
      }

      const usage = scanner.scan(code, id);
      const changed = aggregator.add(id, usage);

      // Invalidate virtual module if usage changed
      if (changed && server) {
        // Debounce invalidation slightly to batch multiple file changes
        setImmediate(() => {
          const currentHash = computeUsageHash(aggregator.getUsage());
          if (currentHash !== lastUsageHash) {
            invalidateVirtualModule();
          }
        });
      }

      return null; // Don't modify source files
    },

    /**
     * Handle file deletion in HMR
     */
    handleHotUpdate(ctx: HmrContext) {
      const { file } = ctx;

      // Check if a scanned file was deleted or changed
      if (scanner.shouldScan(file)) {
        // The transform hook will handle content changes
        // Here we just need to check for deletions
        try {
          require('fs').accessSync(file);
        } catch {
          // File was deleted, remove from aggregator
          if (aggregator.remove(file)) {
            invalidateVirtualModule();
          }
        }
      }

      return undefined;
    },

    /**
     * Scan entire project before production build
     */
    async buildStart() {
      if (!isDev) {
        // Production build: scan entire project
        const cwd = process.cwd();

        if (options.debug) {
          console.log('[hyperfixi] Scanning project for hyperscript usage...');
        }

        const scannedFiles = await scanner.scanProject(cwd);
        aggregator.loadFromScan(scannedFiles);

        if (options.debug) {
          const summary = aggregator.getSummary();
          console.log(`[hyperfixi] Found ${summary.fileCount} files with hyperscript:`, {
            commands: summary.commands,
            blocks: summary.blocks,
            positional: summary.positional,
          });
        }
      }
    },
  };
}

// Default export for convenience
export default hyperfixi;
