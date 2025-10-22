/**
 * Optimized Plugin Registry
 * Performance-focused implementation
 */

import type {
  Plugin,
  PluginRegistry,
  CommandPlugin
} from './types';
import type { PluginMetrics } from './typed';
import { HyperfixiPluginRegistry } from './registry';

export class OptimizedPluginRegistry extends HyperfixiPluginRegistry implements PluginRegistry {
  private compiledPatterns = new Map<string, RegExp>();
  private patternCache = new Map<string, string | null>();
  private metrics = new Map<string, PluginMetrics>();

  override load(...plugins: Plugin[]): void {
    super.load(...plugins);
    
    // Pre-compile patterns and optimize
    for (const plugin of plugins) {
      if (this.isCommandPlugin(plugin)) {
        this.compilePattern(plugin);
      }
      
      // Initialize metrics
      this.metrics.set(plugin.name, {
        executionTime: [],
        callCount: 0,
        errorCount: 0
      });
    }
  }

  /**
   * Pre-compile regex patterns for better performance
   */
  private compilePattern(plugin: CommandPlugin): void {
    if (typeof plugin.pattern === 'string') {
      this.compiledPatterns.set(
        plugin.name,
        new RegExp(`^${plugin.pattern}`)
      );
    } else if (plugin.pattern) {
      this.compiledPatterns.set(plugin.name, plugin.pattern);
    } else {
      // Default pattern based on plugin name
      this.compiledPatterns.set(
        plugin.name,
        new RegExp(`^${plugin.name}\\s+`)
      );
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  getMetrics(pluginName?: string): Map<string, PluginMetrics> | PluginMetrics | undefined {
    if (pluginName) {
      return this.metrics.get(pluginName);
    }
    return new Map(this.metrics);
  }

  /**
   * Clear pattern cache (useful after adding/removing plugins)
   */
  clearCache(): void {
    this.patternCache.clear();
  }

  /**
   * Optimize based on usage patterns
   */
  optimize(): void {
    // Clear cache entries for rarely used patterns
    const cacheThreshold = 10;
    for (const [pattern, pluginName] of this.patternCache.entries()) {
      if (pluginName) {
        const metrics = this.metrics.get(pluginName);
        if (metrics && metrics.callCount < cacheThreshold) {
          this.patternCache.delete(pattern);
        }
      }
    }
  }

  private isCommandPlugin(plugin: Plugin): plugin is CommandPlugin {
    return plugin.type === 'command';
  }
}

// Export optimized singleton
export const optimizedRegistry = new OptimizedPluginRegistry();
