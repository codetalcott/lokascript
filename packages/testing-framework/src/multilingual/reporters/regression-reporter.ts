/**
 * Regression Reporter - Compares current results against baseline
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import type {
  Reporter,
  TestConfig,
  LanguageCode,
  LanguageResults,
  TestResults,
  Baseline,
  RegressionResult,
} from '../types';

/**
 * Regression Reporter
 *
 * Compares test results against a baseline and reports regressions.
 */
export class RegressionReporter implements Reporter {
  private baselinePath: string;
  private baseline: Baseline | null = null;
  private currentResults: TestResults | null = null;
  private regressionResults: RegressionResult[] = [];

  constructor(baselinePath: string = './test-results/baseline.json') {
    this.baselinePath = baselinePath;
    this.loadBaseline();
  }

  /**
   * Load baseline from file
   */
  private loadBaseline(): void {
    if (!existsSync(this.baselinePath)) {
      console.warn(`Warning: Baseline file not found at ${this.baselinePath}`);
      return;
    }

    try {
      const data = readFileSync(this.baselinePath, 'utf-8');
      this.baseline = JSON.parse(data);
    } catch (error) {
      console.error(
        `Error loading baseline: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Report test start
   */
  reportStart(_config: TestConfig): void {
    // No-op
  }

  /**
   * Report language start
   */
  reportLanguageStart(_language: LanguageCode, _bundle: string): void {
    // No-op
  }

  /**
   * Report language complete
   */
  reportLanguageComplete(_results: LanguageResults): void {
    // No-op
  }

  /**
   * Report complete test run - compare to baseline
   */
  reportComplete(results: TestResults): void {
    this.currentResults = results;

    if (!this.baseline) {
      console.log('No baseline available - skipping regression analysis');
      return;
    }

    this.regressionResults = this.compareToBaseline(results);
  }

  /**
   * Get regression results
   */
  getRegressionResults(): RegressionResult[] {
    return this.regressionResults;
  }

  /**
   * Report error
   */
  reportError(_error: Error): void {
    // No-op
  }

  /**
   * Compare current results to baseline
   */
  private compareToBaseline(results: TestResults): RegressionResult[] {
    if (!this.baseline) return [];

    const regressions: RegressionResult[] = [];

    for (const langResult of results.languageResults) {
      const baselineLang = this.baseline.languages[langResult.language];
      if (!baselineLang) continue;

      const parseRateDelta = (langResult.parseRate - baselineLang.parseRate) * 100;
      const avgConfidenceDelta = langResult.avgConfidence - baselineLang.avgConfidence;
      const bundleSizeDelta = this.getBundleSizeDelta(langResult, baselineLang);

      // Identify new failures and successes
      const newFailures = this.findNewFailures(langResult, baselineLang);
      const newSuccesses = this.findNewSuccesses(langResult, baselineLang);

      // Determine status
      let status: 'improved' | 'regressed' | 'unchanged' = 'unchanged';
      if (parseRateDelta < -5 || newFailures.length > 0) {
        status = 'regressed';
      } else if (parseRateDelta > 5 || newSuccesses.length > 0) {
        status = 'improved';
      }

      regressions.push({
        language: langResult.language,
        parseRateDelta,
        avgConfidenceDelta,
        bundleSizeDelta: bundleSizeDelta !== undefined ? bundleSizeDelta : undefined,
        newFailures,
        newSuccesses,
        status,
      });
    }

    return regressions;
  }

  /**
   * Get bundle size delta
   */
  private getBundleSizeDelta(
    current: LanguageResults,
    baseline: { bundleSize: number | undefined }
  ): number | undefined {
    if (!current.bundleSize || !baseline.bundleSize) return undefined;
    return ((current.bundleSize - baseline.bundleSize) / baseline.bundleSize) * 100;
  }

  /**
   * Find patterns that failed in current but passed in baseline
   */
  private findNewFailures(current: LanguageResults, _baseline: { parseSuccess: number }): string[] {
    // Simplified: just return failed pattern IDs
    return current.parseResults
      .filter(r => !r.success)
      .map(r => r.pattern.codeExampleId)
      .slice(0, 10); // Limit to 10
  }

  /**
   * Find patterns that passed in current but failed in baseline
   */
  private findNewSuccesses(
    current: LanguageResults,
    _baseline: { parseSuccess: number }
  ): string[] {
    // Simplified: return successful patterns
    return current.parseResults
      .filter(r => r.success)
      .map(r => r.pattern.codeExampleId)
      .slice(0, 10); // Limit to 10
  }

  /**
   * Save current results as new baseline
   */
  saveAsBaseline(results: TestResults): void {
    const baseline: Baseline = {
      timestamp: results.timestamp,
      commit: results.commit || 'unknown',
      languages: {},
      bundles: {} as Record<
        string,
        { size: number; languages: LanguageCode[]; gzipSize: number | undefined }
      >,
    };

    // Convert bundles to proper format
    for (const [name, info] of Object.entries(results.bundles)) {
      baseline.bundles[name] = {
        size: info.size,
        languages: info.languages,
        gzipSize: info.gzipSize ?? undefined,
      };
    }

    for (const langResult of results.languageResults) {
      baseline.languages[langResult.language] = {
        parseSuccess: langResult.parseSuccess,
        parseFailure: langResult.parseFailure,
        parseRate: langResult.parseRate,
        avgConfidence: langResult.avgConfidence,
        bundleSize: langResult.bundleSize ?? undefined,
      };
    }

    writeFileSync(this.baselinePath, JSON.stringify(baseline, null, 2));
    console.log(`Baseline saved to ${this.baselinePath}`);
  }

  /**
   * Check if baseline exists
   */
  hasBaseline(): boolean {
    return this.baseline !== null;
  }
}

/**
 * Create a regression reporter
 */
export function createRegressionReporter(baselinePath?: string): RegressionReporter {
  return new RegressionReporter(baselinePath);
}
