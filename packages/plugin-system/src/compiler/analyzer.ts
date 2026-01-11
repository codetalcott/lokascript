/**
 * Compile-time Plugin Analysis
 * Analyzes HTML/templates to determine which plugins are needed
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { Plugin } from '../types';

export interface AnalysisResult {
  requiredPlugins: Set<string>;
  attributePatterns: Map<string, string[]>;
  usageStats: Map<string, number>;
}

export class PluginAnalyzer {
  private plugins: Map<string, Plugin> = new Map();
  
  constructor(plugins: Plugin[]) {
    plugins.forEach(p => this.plugins.set(p.name, p));
  }

  /**
   * Analyze HTML content to determine required plugins
   */
  analyzeHTML(html: string): AnalysisResult {
    const requiredPlugins = new Set<string>();
    const attributePatterns = new Map<string, string[]>();
    const usageStats = new Map<string, number>();

    // Parse HTML to find all hyperscript attributes
    const hsAttributeRegex = /(?:_|data-hs)="([^"]*)"/g;
    const matches = html.matchAll(hsAttributeRegex);

    for (const match of matches) {
      const expression = match[1];
      this.analyzeExpression(expression, requiredPlugins, attributePatterns, usageStats);
    }

    // Also check for feature attributes
    const featureRegex = /data-(?:fetch|state|intersect|ws)[^=]*(?:="[^"]*")?/g;
    const featureMatches = html.matchAll(featureRegex);

    for (const match of featureMatches) {
      const attr = match[0];
      const pluginName = this.getFeaturePluginName(attr);
      if (pluginName) {
        requiredPlugins.add(pluginName);
        this.incrementUsage(usageStats, pluginName);
      }
    }

    return { requiredPlugins, attributePatterns, usageStats };
  }

  /**
   * Analyze a directory of files
   */
  async analyzeDirectory(dir: string, extensions = ['.html', '.htm', '.tsx', '.jsx', '.vue', '.svelte']): Promise<AnalysisResult> {
    const result: AnalysisResult = {
      requiredPlugins: new Set(),
      attributePatterns: new Map(),
      usageStats: new Map()
    };

    const files = await this.getFilesRecursive(dir, extensions);

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const fileAnalysis = this.analyzeHTML(content);

        // Merge required plugins
        for (const plugin of fileAnalysis.requiredPlugins) {
          result.requiredPlugins.add(plugin);
        }

        // Merge attribute patterns
        for (const [cmd, patterns] of fileAnalysis.attributePatterns) {
          const existing = result.attributePatterns.get(cmd) || [];
          for (const pattern of patterns) {
            if (!existing.includes(pattern)) {
              existing.push(pattern);
            }
          }
          result.attributePatterns.set(cmd, existing);
        }

        // Merge usage stats
        for (const [plugin, count] of fileAnalysis.usageStats) {
          result.usageStats.set(plugin, (result.usageStats.get(plugin) || 0) + count);
        }
      } catch (error) {
        // Skip files that can't be read (permissions, encoding issues, etc.)
        console.warn(`Could not analyze file ${file}:`, error);
      }
    }

    return result;
  }

  /**
   * Recursively get all files matching the given extensions
   */
  private async getFilesRecursive(dir: string, extensions: string[]): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
            continue;
          }
          // Recurse into subdirectory
          const subFiles = await this.getFilesRecursive(fullPath, extensions);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          // Check if file has matching extension
          const ext = path.extname(entry.name).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
      console.warn(`Could not read directory ${dir}:`, error);
    }

    return files;
  }

  /**
   * Generate optimized plugin bundle based on analysis
   */
  generateOptimizedBundle(analysis: AnalysisResult): string {
    const imports: string[] = [];
    const loads: string[] = [];

    // Sort plugins by usage frequency for optimal loading order
    const sortedPlugins = Array.from(analysis.requiredPlugins)
      .sort((a, b) => (analysis.usageStats.get(b) || 0) - (analysis.usageStats.get(a) || 0));

    for (const pluginName of sortedPlugins) {
      const plugin = this.plugins.get(pluginName);
      if (plugin) {
        const importName = this.getImportName(plugin);
        imports.push(`import { ${importName} } from '../plugins/${plugin.type}s';`);
        loads.push(importName);
      }
    }

    return `/**
 * Auto-generated optimized bundle
 * Generated at: ${new Date().toISOString()}
 * Required plugins: ${sortedPlugins.join(', ')}
 */

import { pluginRegistry } from '../registry';
${imports.join('\n')}

// Load plugins in order of usage frequency
pluginRegistry.load(
  ${loads.join(',\n  ')}
);

// Apply immediately if DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => pluginRegistry.apply());
  } else {
    pluginRegistry.apply();
  }
}

export { pluginRegistry };
`;
  }

  private analyzeExpression(
    expression: string,
    requiredPlugins: Set<string>,
    attributePatterns: Map<string, string[]>,
    usageStats: Map<string, number>
  ): void {
    // Check command plugins
    const commands = ['on', 'toggle', 'send', 'add', 'remove', 'set', 'call'];
    for (const cmd of commands) {
      const regex = new RegExp(`\\b${cmd}\\b`);
      if (regex.test(expression)) {
        requiredPlugins.add(cmd);
        this.incrementUsage(usageStats, cmd);
        
        // Track patterns for optimization
        const patterns = attributePatterns.get(cmd) || [];
        if (!patterns.includes(expression)) {
          patterns.push(expression);
          attributePatterns.set(cmd, patterns);
        }
      }
    }
  }

  private getFeaturePluginName(attr: string): string | null {
    if (attr.startsWith('data-fetch')) return 'auto-fetch';
    if (attr.startsWith('data-state')) return 'reactive-state';
    if (attr.startsWith('data-intersect')) return 'intersection';
    if (attr.startsWith('data-ws')) return 'websocket';
    return null;
  }

  private getImportName(plugin: Plugin): string {
    return plugin.name
      .split('-')
      .map((part, i) => i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Plugin';
  }

  private incrementUsage(stats: Map<string, number>, plugin: string): void {
    stats.set(plugin, (stats.get(plugin) || 0) + 1);
  }
}

/**
 * Build-time plugin optimization
 */
export async function optimizePluginsForBuild(config: {
  srcDir: string;
  plugins: Plugin[];
  outputPath: string;
}): Promise<void> {
  const analyzer = new PluginAnalyzer(config.plugins);
  const analysis = await analyzer.analyzeDirectory(config.srcDir);
  const bundleCode = analyzer.generateOptimizedBundle(analysis);
  
  // Write to file system
  console.log(`Would write optimized bundle to: ${config.outputPath}`);
  console.log(bundleCode);
}
