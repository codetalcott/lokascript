/**
 * Size Validator - Validates bundle sizes against thresholds
 */

import { statSync, existsSync } from 'node:fs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { SizeResult, Validator, BundleInfo } from '../types';

const execAsync = promisify(exec);

/**
 * Bundle size thresholds (bytes)
 */
const SIZE_THRESHOLDS = {
  browser: 300 * 1024, // 300 KB for full bundle
  'browser-priority': 200 * 1024, // 200 KB for priority languages
  'browser-western': 150 * 1024, // 150 KB for western languages
  'browser-east-asian': 120 * 1024, // 120 KB for east asian
  'browser-en': 80 * 1024, // 80 KB for single language
  'browser-es': 80 * 1024,
  'browser-ja': 90 * 1024,
  'browser-ar': 85 * 1024,
  'browser-ko': 80 * 1024,
  'browser-zh': 75 * 1024,
};

/**
 * Default threshold for unknown bundles (100 KB)
 */
const DEFAULT_THRESHOLD = 100 * 1024;

/**
 * Size Validator
 *
 * Validates bundle sizes and tracks size regression.
 */
export class SizeValidator implements Validator<SizeResult> {
  private thresholds: Record<string, number>;

  constructor(customThresholds?: Record<string, number>) {
    this.thresholds = { ...SIZE_THRESHOLDS, ...customThresholds };
  }

  /**
   * Get validator name
   */
  getName(): string {
    return 'SizeValidator';
  }

  /**
   * Validate bundle size
   */
  async validate(bundle: BundleInfo): Promise<SizeResult> {
    if (!existsSync(bundle.path)) {
      throw new Error(`Bundle not found: ${bundle.path}`);
    }

    const size = statSync(bundle.path).size;
    const threshold = this.thresholds[bundle.name] || DEFAULT_THRESHOLD;

    // Try to get gzip size
    let gzipSize: number | undefined;
    try {
      gzipSize = await this.getGzipSize(bundle.path);
    } catch {
      // Gzip measurement failed, continue without it
    }

    return {
      bundlePath: bundle.path,
      size,
      gzipSize,
      exceedsThreshold: size > threshold,
      threshold,
    };
  }

  /**
   * Get gzipped size of a file
   */
  private async getGzipSize(filePath: string): Promise<number> {
    try {
      // Use gzip -c to compress to stdout and wc -c to count bytes
      const { stdout } = await execAsync(`gzip -c "${filePath}" | wc -c`);
      return parseInt(stdout.trim(), 10);
    } catch {
      // Fallback: estimate as ~35% of original size
      const size = statSync(filePath).size;
      return Math.round(size * 0.35);
    }
  }

  /**
   * Validate multiple bundles
   */
  async validateAll(bundles: BundleInfo[]): Promise<SizeResult[]> {
    const results: SizeResult[] = [];

    for (const bundle of bundles) {
      if (bundle.exists) {
        const result = await this.validate(bundle);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Check if size increase is acceptable
   */
  isSizeIncreaseAcceptable(
    currentSize: number,
    baselineSize: number,
    maxIncrease: number = 0.1 // 10% by default
  ): boolean {
    if (baselineSize === 0) return true;
    const increase = (currentSize - baselineSize) / baselineSize;
    return increase <= maxIncrease;
  }

  /**
   * Get size change percentage
   */
  getSizeChange(currentSize: number, baselineSize: number): number {
    if (baselineSize === 0) return 0;
    return ((currentSize - baselineSize) / baselineSize) * 100;
  }

  /**
   * Format size in human-readable format
   */
  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Get statistics from size results
   */
  static getStatistics(results: SizeResult[]) {
    const total = results.length;
    const exceedingThreshold = results.filter(r => r.exceedsThreshold).length;

    const totalSize = results.reduce((sum, r) => sum + r.size, 0);
    const totalGzipSize = results.reduce((sum, r) => sum + (r.gzipSize || 0), 0);

    const avgSize = totalSize / (total || 1);
    const avgGzipSize = totalGzipSize / (total || 1);

    return {
      total,
      exceedingThreshold,
      totalSize,
      totalGzipSize,
      avgSize,
      avgGzipSize,
      compressionRatio: totalSize > 0 ? totalGzipSize / totalSize : 0,
    };
  }
}

/**
 * Quick validation helper
 */
export async function validateBundleSize(bundle: BundleInfo): Promise<SizeResult> {
  const validator = new SizeValidator();
  return await validator.validate(bundle);
}

/**
 * Validate sizes and return summary
 */
export async function validateAndSummarizeSizes(bundles: BundleInfo[]) {
  const validator = new SizeValidator();
  const results = await validator.validateAll(bundles);
  const stats = SizeValidator.getStatistics(results);

  return {
    results,
    stats,
    exceeding: results.filter(r => r.exceedsThreshold),
  };
}
