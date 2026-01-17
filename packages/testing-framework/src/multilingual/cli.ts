#!/usr/bin/env node
/**
 * Multilingual Testing CLI
 *
 * Command-line interface for running multilingual tests.
 */

import { TestOrchestrator } from './orchestrator';
import { RegressionReporter } from './reporters/regression-reporter';
import type { TestConfig, LanguageCode } from './types';

/**
 * Parse command-line arguments
 */
function parseArgs(): TestConfig {
  const args = process.argv.slice(2);
  const config: TestConfig = {
    mode: 'quick',
    quickModeLimit: 10,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--language':
      case '-l': {
        const lang = args[++i];
        if (lang) config.languages = [lang as LanguageCode];
        break;
      }

      case '--languages': {
        const langs = args[++i];
        if (langs) config.languages = langs.split(',') as LanguageCode[];
        break;
      }

      case '--bundle':
      case '-b': {
        const bundle = args[++i];
        if (bundle) config.bundle = bundle;
        break;
      }

      case '--build':
        config.build = true;
        break;

      case '--mode':
      case '-m':
        config.mode = args[++i] as 'quick' | 'full';
        break;

      case '--quick':
        config.mode = 'quick';
        break;

      case '--full':
        config.mode = 'full';
        break;

      case '--verbose':
      case '-v':
        config.verbose = true;
        break;

      case '--regression':
      case '-r':
        config.regression = true;
        break;

      case '--confidence':
      case '-c': {
        const conf = args[++i];
        if (conf) config.confidenceThreshold = parseFloat(conf);
        break;
      }

      case '--verified-only':
        config.verifiedOnly = true;
        break;

      case '--categories': {
        const cats = args[++i];
        if (cats) config.categories = cats.split(',');
        break;
      }

      case '--limit': {
        const lim = args[++i];
        if (lim) config.quickModeLimit = parseInt(lim, 10);
        break;
      }

      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;

      case '--save-baseline':
        // Special flag to save results as baseline
        runAndSaveBaseline();
        return config; // Early return to avoid running tests below

      default:
        if (arg && arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
        break;
    }
  }

  return config;
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
Multilingual Test Runner

USAGE:
  npm run test:multilingual [OPTIONS]

OPTIONS:
  -l, --language <code>        Test specific language (en, ja, es, etc.)
      --languages <codes>      Test multiple languages (comma-separated)
  -b, --bundle <name>          Use specific bundle
      --build                  Build bundle before testing
  -m, --mode <mode>            Test mode: 'quick' or 'full' (default: quick)
      --quick                  Quick mode (10 patterns per language)
      --full                   Full mode (all patterns)
  -v, --verbose                Enable verbose output
  -r, --regression             Compare to baseline and report regressions
  -c, --confidence <n>         Minimum confidence threshold (0-1)
      --verified-only          Only test verified translations
      --categories <cats>      Filter by categories (comma-separated)
      --limit <n>              Patterns per language in quick mode (default: 10)
      --save-baseline          Save current results as new baseline
  -h, --help                   Show this help message

EXAMPLES:
  # Test all languages in quick mode
  npm run test:multilingual

  # Test specific language with verbose output
  npm run test:multilingual -- --language ja --verbose

  # Test multiple languages in full mode
  npm run test:multilingual -- --languages ja,ko,es --full

  # Build bundle and test with regression comparison
  npm run test:multilingual -- --build --regression

  # Save current results as baseline
  npm run test:multilingual -- --save-baseline
`);
}

/**
 * Run tests and save as baseline
 */
async function runAndSaveBaseline(): Promise<void> {
  try {
    // Parse config without --save-baseline
    const args = process.argv.slice(2).filter(arg => arg !== '--save-baseline');
    process.argv = [...process.argv.slice(0, 2), ...args];

    const config = parseArgs();
    config.regression = true; // Enable regression reporter

    const orchestrator = new TestOrchestrator(config);
    const results = await orchestrator.run();

    // Save as baseline
    const regressionReporter = orchestrator.getRegressionReporter();
    if (regressionReporter) {
      regressionReporter.saveAsBaseline(results);
    } else {
      // Create reporter and save
      const reporter = new RegressionReporter();
      reporter.saveAsBaseline(results);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  try {
    const config = parseArgs();

    const orchestrator = new TestOrchestrator(config);
    const results = await orchestrator.run();

    // Exit with appropriate code
    const exitCode = results.summary.overallStatus === 'pass' ? 0 : 1;
    process.exit(exitCode);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Check if running as CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export for programmatic use
export { main, parseArgs, showHelp };
