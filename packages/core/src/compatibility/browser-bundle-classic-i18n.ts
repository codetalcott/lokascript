/**
 * HyperFixi Classic Browser Bundle with i18n Support
 *
 * Combines the classic _hyperscript runtime (37 commands) with full
 * internationalization support including:
 * - 8 language keyword providers (es, ja, fr, de, ar, ko, zh, tr)
 * - Automatic browser locale detection
 * - Runtime locale switching
 * - Grammar transformation for native word order display
 *
 * Usage:
 * ```html
 * <script src="hyperfixi-browser-classic-i18n.js"></script>
 * <script>
 *   // Auto-detects browser locale, or set manually:
 *   hyperfixi.i18n.setLocale('ja');
 *
 *   // Write hyperscript in Japanese
 *   // クリック で #count を 増加
 * </script>
 * ```
 *
 * Size: ~374 KB uncompressed (~100 KB gzipped)
 */

import { parse } from '../parser/parser';
import { createMinimalRuntime } from '../runtime/runtime-experimental';
import { createMinimalAttributeProcessor } from '../dom/minimal-attribute-processor';
import { createContext } from '../core/context';
import type { KeywordResolver } from '../parser/types';

// ============================================================================
// Expression Categories (for ConfigurableExpressionEvaluator)
// ============================================================================
import { ConfigurableExpressionEvaluator } from '../core/configurable-expression-evaluator';
import { referencesExpressions } from '../expressions/references/index';
import { logicalExpressions } from '../expressions/logical/index';
import { specialExpressions } from '../expressions/special/index';
import { propertiesExpressions } from '../expressions/properties/index';
import { conversionExpressions } from '../expressions/conversion/index';
import { positionalExpressions } from '../expressions/positional/index';

// ============================================================================
// DOM Commands (7)
// ============================================================================
import { createAddCommand } from '../commands/dom/add';
import { createRemoveCommand } from '../commands/dom/remove';
import { createToggleCommand } from '../commands/dom/toggle';
import { createPutCommand } from '../commands/dom/put';
import { createHideCommand } from '../commands/dom/hide';
import { createShowCommand } from '../commands/dom/show';
import { createMakeCommand } from '../commands/dom/make';

// ============================================================================
// Control Flow Commands (9)
// ============================================================================
import { createIfCommand } from '../commands/control-flow/if';
import { createUnlessCommand } from '../commands/control-flow/unless';
import { createRepeatCommand } from '../commands/control-flow/repeat';
import { createBreakCommand } from '../commands/control-flow/break';
import { createContinueCommand } from '../commands/control-flow/continue';
import { createHaltCommand } from '../commands/control-flow/halt';
import { createReturnCommand } from '../commands/control-flow/return';
import { createExitCommand } from '../commands/control-flow/exit';
import { createThrowCommand } from '../commands/control-flow/throw';

// ============================================================================
// Data Commands (5)
// ============================================================================
import { createSetCommand } from '../commands/data/set';
import { createGetCommand } from '../commands/data/get';
import { createIncrementCommand } from '../commands/data/increment';
import { createDecrementCommand } from '../commands/data/decrement';
import { createDefaultCommand } from '../commands/data/default';

// ============================================================================
// Async Commands (2)
// ============================================================================
import { createWaitCommand } from '../commands/async/wait';
import { createFetchCommand } from '../commands/async/fetch';

// ============================================================================
// Event Commands (2)
// ============================================================================
import { createTriggerCommand } from '../commands/events/trigger';
import { createSendCommand } from '../commands/events/send';

// ============================================================================
// Animation Commands (4)
// ============================================================================
import { createTransitionCommand } from '../commands/animation/transition';
import { createMeasureCommand } from '../commands/animation/measure';
import { createSettleCommand } from '../commands/animation/settle';
import { createTakeCommand } from '../commands/animation/take';

// ============================================================================
// Utility Commands (6)
// ============================================================================
import { createLogCommand } from '../commands/utility/log';
import { createTellCommand } from '../commands/utility/tell';
import { createCallCommand } from '../commands/execution/call';
import { createCopyCommand } from '../commands/utility/copy';
import { createPickCommand } from '../commands/utility/pick';
import { createBeepCommand } from '../commands/utility/beep';

// ============================================================================
// Advanced Commands (2)
// ============================================================================
import { createJsCommand } from '../commands/advanced/js';
import { createAsyncCommand } from '../commands/advanced/async';

// ============================================================================
// Navigation Commands (1)
// ============================================================================
import { createGoCommand } from '../commands/navigation/go';

// ============================================================================
// Special Commands (4)
// ============================================================================
import { createInstallCommand } from '../commands/behaviors/install';
import { createAppendCommand } from '../commands/content/append';
import { createRenderCommand } from '../commands/templates/render';
import { createPseudoCommand } from '../commands/execution/pseudo-command';

// ============================================================================
// i18n Imports
// ============================================================================

// Keyword providers for each supported locale
import {
  esKeywords,
  jaKeywords,
  frKeywords,
  deKeywords,
  arKeywords,
  koKeywords,
  zhKeywords,
  trKeywords,
  createKeywordProvider,
  createEnglishProvider,
  LocaleManager,
  detectBrowserLocale,
  // Grammar transformation
  GrammarTransformer,
  toLocale,
  toEnglish,
  translate,
  profiles,
  getProfile,
  getSupportedLocales,
  // Dictionaries for custom providers
  es as esDictionary,
  ja as jaDictionary,
  fr as frDictionary,
  de as deDictionary,
  ar as arDictionary,
  ko as koDictionary,
  zh as zhDictionary,
  tr as trDictionary,
} from '@hyperfixi/i18n/browser';

// ============================================================================
// i18n Setup - Register all locale providers
// ============================================================================

// Register all built-in locale providers
LocaleManager.register('en', createEnglishProvider());
LocaleManager.register('es', esKeywords);
LocaleManager.register('ja', jaKeywords);
LocaleManager.register('fr', frKeywords);
LocaleManager.register('de', deKeywords);
LocaleManager.register('ar', arKeywords);
LocaleManager.register('ko', koKeywords);
LocaleManager.register('zh', zhKeywords);
LocaleManager.register('tr', trKeywords);

// Track current locale
let currentLocale = 'en';

/**
 * Get the current keyword resolver based on active locale
 */
function getCurrentKeywordResolver(): KeywordResolver | undefined {
  if (currentLocale === 'en') {
    return undefined; // No resolver needed for English
  }
  return LocaleManager.get(currentLocale);
}

// ============================================================================
// Runtime Setup
// ============================================================================

// Create ConfigurableExpressionEvaluator with all 6 expression categories
const expressionEvaluator = new ConfigurableExpressionEvaluator([
  referencesExpressions,
  logicalExpressions,
  specialExpressions,
  propertiesExpressions,
  conversionExpressions,
  positionalExpressions,
]);

// Create runtime instance with classic commands (37 total)
const runtimeExperimental = createMinimalRuntime([
  // DOM (7)
  createAddCommand(),
  createRemoveCommand(),
  createToggleCommand(),
  createPutCommand(),
  createHideCommand(),
  createShowCommand(),
  createMakeCommand(),

  // Control Flow (9)
  createIfCommand(),
  createUnlessCommand(),
  createRepeatCommand(),
  createBreakCommand(),
  createContinueCommand(),
  createHaltCommand(),
  createReturnCommand(),
  createExitCommand(),
  createThrowCommand(),

  // Data (5)
  createSetCommand(),
  createGetCommand(),
  createIncrementCommand(),
  createDecrementCommand(),
  createDefaultCommand(),

  // Async (2)
  createWaitCommand(),
  createFetchCommand(),

  // Events (2)
  createTriggerCommand(),
  createSendCommand(),

  // Animation (4)
  createTransitionCommand(),
  createMeasureCommand(),
  createSettleCommand(),
  createTakeCommand(),

  // Utility (6)
  createLogCommand(),
  createTellCommand(),
  createCallCommand(),
  createCopyCommand(),
  createPickCommand(),
  createBeepCommand(),

  // Advanced (2)
  createJsCommand(),
  createAsyncCommand(),

  // Navigation (1)
  createGoCommand(),

  // Special (4)
  createInstallCommand(),
  createAppendCommand(),
  createRenderCommand(),
  createPseudoCommand(),
], { expressionEvaluator });

// ============================================================================
// i18n-Aware Runtime Adapter
// ============================================================================

/**
 * Parse with locale-aware keyword resolution
 */
function parseWithLocale(code: string) {
  const keywords = getCurrentKeywordResolver();
  return parse(code, keywords ? { keywords } : undefined);
}

// Create adapter for MinimalAttributeProcessor
const runtimeAdapter = {
  parse: (code: string) => parseWithLocale(code),
  execute: async (code: string, context?: any) => {
    const ctx = context || createContext();
    const parseResult = parseWithLocale(code);
    if (!parseResult.success || !parseResult.node) {
      throw new Error(parseResult.error?.message || 'Parse failed');
    }
    return await runtimeExperimental.execute(parseResult.node, ctx);
  }
};

// Create minimal attribute processor with adapter
const attributeProcessor = createMinimalAttributeProcessor(runtimeAdapter);

// ============================================================================
// i18n API
// ============================================================================

const i18nApi = {
  /**
   * Get current locale
   */
  getLocale(): string {
    return currentLocale;
  },

  /**
   * Set active locale for parsing
   * @param locale - Locale code (e.g., 'es', 'ja', 'zh')
   */
  setLocale(locale: string): void {
    if (!LocaleManager.has(locale)) {
      console.warn(`Locale '${locale}' not registered. Available: ${LocaleManager.getAvailable().join(', ')}`);
      return;
    }
    currentLocale = locale;
    LocaleManager.setDefault(locale);

    // Update document attributes for RTL support
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', locale);
      const profile = getProfile(locale);
      if (profile?.direction === 'rtl') {
        document.documentElement.setAttribute('dir', 'rtl');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
      }
    }
  },

  /**
   * Get list of available locales
   */
  getAvailableLocales(): string[] {
    return LocaleManager.getAvailable();
  },

  /**
   * Detect browser locale and set if available
   * @returns The detected locale (or 'en' if not supported)
   */
  detectAndSetLocale(): string {
    if (typeof navigator === 'undefined') {
      return 'en';
    }

    // Get browser languages in order of preference
    const languages = navigator.languages || [navigator.language];

    for (const lang of languages) {
      // Extract the base language code (e.g., 'es-MX' -> 'es')
      const baseLocale = lang.split('-')[0].toLowerCase();

      if (LocaleManager.has(baseLocale)) {
        this.setLocale(baseLocale);
        return baseLocale;
      }
    }

    return 'en';
  },

  /**
   * Register a custom locale provider
   */
  registerLocale(locale: string, provider: KeywordResolver): void {
    LocaleManager.register(locale, provider as any);
  },

  /**
   * Transform hyperscript to display in target locale's native word order
   * @param code - English hyperscript code
   * @param targetLocale - Target locale (default: current locale)
   */
  toLocale(code: string, targetLocale?: string): string {
    return toLocale(code, targetLocale || currentLocale);
  },

  /**
   * Transform localized hyperscript to English
   * @param code - Localized hyperscript code
   * @param sourceLocale - Source locale (default: current locale)
   */
  toEnglish(code: string, sourceLocale?: string): string {
    return toEnglish(code, sourceLocale || currentLocale);
  },

  /**
   * Translate hyperscript between any two locales
   */
  translate,

  /**
   * Create a grammar transformer for advanced transformations
   */
  createTransformer(sourceLocale: string, targetLocale: string): GrammarTransformer {
    return new GrammarTransformer(sourceLocale, targetLocale);
  },

  /**
   * Get language profile for a locale
   */
  getProfile,

  /**
   * Get all supported locales for grammar transformation
   */
  getSupportedGrammarLocales: getSupportedLocales,

  /**
   * All language profiles
   */
  profiles,

  /**
   * Dictionaries for creating custom providers
   */
  dictionaries: {
    en: {}, // English is canonical, no dictionary needed
    es: esDictionary,
    ja: jaDictionary,
    fr: frDictionary,
    de: deDictionary,
    ar: arDictionary,
    ko: koDictionary,
    zh: zhDictionary,
    tr: trDictionary,
  },

  /**
   * Create a keyword provider from a dictionary
   */
  createKeywordProvider,
};

// ============================================================================
// API Export
// ============================================================================

const api = {
  runtime: runtimeAdapter,
  parse: (code: string) => parseWithLocale(code),
  execute: async (code: string, context?: any) => runtimeAdapter.execute(code, context),
  createContext,
  attributeProcessor,
  version: '1.1.0-classic-i18n',

  // i18n API
  i18n: i18nApi,

  // Classic commands list (37)
  commands: [
    // DOM (7)
    'add', 'remove', 'toggle', 'put', 'hide', 'show', 'make',
    // Control Flow (9)
    'if', 'unless', 'repeat', 'break', 'continue', 'halt', 'return', 'exit', 'throw',
    // Data (5)
    'set', 'get', 'increment', 'decrement', 'default',
    // Async (2)
    'wait', 'fetch',
    // Events (2)
    'trigger', 'send',
    // Animation (4)
    'transition', 'measure', 'settle', 'take',
    // Utility (6)
    'log', 'tell', 'call', 'copy', 'pick', 'beep',
    // Advanced (2)
    'js', 'async',
    // Navigation (1)
    'go',
    // Special (4)
    'install', 'append', 'render', 'pseudo-command'
  ],

  // Supported locales
  locales: ['en', 'es', 'ja', 'fr', 'de', 'ar', 'ko', 'zh', 'tr'],

  /**
   * Evaluate hyperscript code (convenience method)
   */
  eval: async (code: string, context?: any) => runtimeAdapter.execute(code, context),

  /**
   * Initialize DOM scanning for _="" attributes
   * Optionally auto-detects browser locale
   */
  init: (options?: { autoDetectLocale?: boolean }) => {
    // Auto-detect locale if requested (default: true)
    if (options?.autoDetectLocale !== false) {
      i18nApi.detectAndSetLocale();
    }
    attributeProcessor.init();
  }
};

// Expose global API
if (typeof window !== 'undefined') {
  (window as any).hyperfixi = api;

  // Auto-initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      api.init();
    });
  } else {
    // DOM already loaded
    api.init();
  }
}

// Export the API object
export default api;
