/**
 * Multilingual Testing Framework
 *
 * Automated validation of HyperFixi's multilingual system.
 */

// Main orchestrator
export { TestOrchestrator, runMultilingualTests } from './orchestrator';

// Types
export type {
  LanguageCode,
  WordOrder,
  Pattern,
  PatternTranslation,
  TestConfig,
  ParseResult,
  SizeResult,
  LanguageResults,
  TestResults,
  Baseline,
  RegressionResult,
  BundleInfo,
  BundleBuildOptions,
  Reporter,
  Validator,
  SamplingStrategy,
} from './types';

// Pattern loading
export {
  loadPatterns,
  getPatternStatistics,
  loadPatternsByCategory,
  countPatternsByLanguage,
} from './pattern-loader';

// Bundle building
export {
  findBundleForLanguages,
  getBundleInfo,
  buildBundle,
  selectBundle,
  listAvailableBundles,
  bundleExists,
  getBundleSize,
  estimateBundleSize,
} from './bundle-builder';

// Validators
export {
  ParseValidator,
  validatePatterns,
  validateAndSummarize,
} from './validators/parse-validator';
export {
  SizeValidator,
  validateBundleSize,
  validateAndSummarizeSizes,
} from './validators/size-validator';

// Reporters
export { ConsoleReporter, createConsoleReporter } from './reporters/console-reporter';
export { JSONReporter, createJSONReporter } from './reporters/json-reporter';
export { RegressionReporter, createRegressionReporter } from './reporters/regression-reporter';

// CLI
export { main as runCLI, parseArgs, showHelp } from './cli';
