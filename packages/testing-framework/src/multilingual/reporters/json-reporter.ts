/**
 * JSON Reporter - Structured JSON output for programmatic consumption
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Reporter, TestConfig, LanguageCode, LanguageResults, TestResults } from '../types';

/**
 * JSON Reporter
 *
 * Outputs structured JSON results to a file.
 */
export class JSONReporter implements Reporter {
  private outputPath: string;
  private results: TestResults | null = null;

  constructor(outputPath: string = './test-results/results.json') {
    this.outputPath = outputPath;
  }

  /**
   * Report test start (no-op for JSON reporter)
   */
  reportStart(_config: TestConfig): void {
    // No output at start
  }

  /**
   * Report language start (no-op for JSON reporter)
   */
  reportLanguageStart(_language: LanguageCode, _bundle: string): void {
    // No output during execution
  }

  /**
   * Report language complete (no-op for JSON reporter)
   */
  reportLanguageComplete(_results: LanguageResults): void {
    // No output during execution
  }

  /**
   * Report complete test run - write JSON file
   */
  reportComplete(results: TestResults): void {
    this.results = results;
    this.writeResults();
  }

  /**
   * Report error
   */
  reportError(error: Error): void {
    const errorResult = {
      error: {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
    };

    // Ensure output directory exists
    const dir = dirname(this.outputPath);
    mkdirSync(dir, { recursive: true });

    writeFileSync(this.outputPath, JSON.stringify(errorResult, null, 2));
  }

  /**
   * Write results to file
   */
  private writeResults(): void {
    if (!this.results) {
      throw new Error('No results to write');
    }

    // Ensure output directory exists
    const dir = dirname(this.outputPath);
    mkdirSync(dir, { recursive: true });

    const json = JSON.stringify(this.results, null, 2);
    writeFileSync(this.outputPath, json);
  }

  /**
   * Get results
   */
  getResults(): TestResults | null {
    return this.results;
  }
}

/**
 * Create a JSON reporter
 */
export function createJSONReporter(outputPath?: string): JSONReporter {
  return new JSONReporter(outputPath);
}
