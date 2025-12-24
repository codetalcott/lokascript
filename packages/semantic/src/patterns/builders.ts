/**
 * Pattern Builders
 *
 * Functions for building and generating patterns for specific languages.
 */

import type { LanguagePattern } from '../types';

// Import from subdirectories for tree-shaking
import { getTogglePatternsForLanguage } from './toggle/index';
import { getPutPatternsForLanguage } from './put/index';
import { getEventHandlerPatternsForLanguage } from './event-handler/index';

// Import new multilingual command patterns
import { getAddPatternsForLanguage } from './add/index';
import { getRemovePatternsForLanguage } from './remove/index';
import { getShowPatternsForLanguage } from './show/index';
import { getHidePatternsForLanguage } from './hide/index';
import { getSetPatternsForLanguage } from './set/index';

// Import English-only patterns
import { getEnglishOnlyPatterns } from './languages/en';

// Import schemas directly from command-schemas (not from barrel to avoid pulling all profiles)
import {
  toggleSchema,
  addSchema,
  removeSchema,
  showSchema,
  hideSchema,
  waitSchema,
  logSchema,
  incrementSchema,
  decrementSchema,
  sendSchema,
  goSchema,
  fetchSchema,
  appendSchema,
  prependSchema,
  triggerSchema,
  setSchema,
  putSchema,
  // Tier 2: Content & variable operations
  takeSchema,
  makeSchema,
  cloneSchema,
  getCommandSchema,
  // Tier 3: Control flow & DOM
  callSchema,
  returnSchema,
  focusSchema,
  blurSchema,
  // Tier 4: DOM Content Manipulation
  swapSchema,
  morphSchema,
  // Tier 5: Control flow & Behavior system
  haltSchema,
  behaviorSchema,
  installSchema,
  measureSchema,
} from '../generators/command-schemas';

// Import generator directly (not from barrel)
import { generatePatternsForCommand } from '../generators/pattern-generator';

// =============================================================================
// Generated Patterns (New Commands)
// =============================================================================

/**
 * Generate patterns for all commands.
 * Called lazily to ensure language profiles are registered first.
 */
function generateAllCommandPatterns(): LanguagePattern[] {
  return [
    // Tier 0: Toggle (generated for languages without hand-crafted patterns)
    // Hand-crafted patterns exist for: en, ja, ar, es, ko, zh, tr
    // Generated patterns fill gap for: pt, fr, de, id, qu, sw
    ...generatePatternsForCommand(toggleSchema),
    // Tier 1: Core commands
    ...generatePatternsForCommand(addSchema),
    ...generatePatternsForCommand(removeSchema),
    ...generatePatternsForCommand(showSchema),
    ...generatePatternsForCommand(hideSchema),
    ...generatePatternsForCommand(waitSchema),
    ...generatePatternsForCommand(logSchema),
    ...generatePatternsForCommand(incrementSchema),
    ...generatePatternsForCommand(decrementSchema),
    ...generatePatternsForCommand(sendSchema),
    ...generatePatternsForCommand(goSchema),
    ...generatePatternsForCommand(fetchSchema),
    ...generatePatternsForCommand(appendSchema),
    ...generatePatternsForCommand(prependSchema),
    ...generatePatternsForCommand(triggerSchema),
    ...generatePatternsForCommand(setSchema),
    // Put command - hand-crafted patterns exist for en, ja, ar, es
    // Generated patterns fill gap for: ko, zh, tr, pt, fr, de, id, qu, sw
    ...generatePatternsForCommand(putSchema),
    // Tier 2: Content & variable operations
    ...generatePatternsForCommand(takeSchema),
    ...generatePatternsForCommand(makeSchema),
    ...generatePatternsForCommand(cloneSchema),
    ...generatePatternsForCommand(getCommandSchema),
    // Tier 3: Control flow & DOM
    ...generatePatternsForCommand(callSchema),
    ...generatePatternsForCommand(returnSchema),
    ...generatePatternsForCommand(focusSchema),
    ...generatePatternsForCommand(blurSchema),
    // Tier 4: DOM Content Manipulation
    ...generatePatternsForCommand(swapSchema),
    ...generatePatternsForCommand(morphSchema),
    // Tier 5: Control flow & Behavior system
    ...generatePatternsForCommand(haltSchema),
    ...generatePatternsForCommand(behaviorSchema),
    ...generatePatternsForCommand(installSchema),
    ...generatePatternsForCommand(measureSchema),
  ];
}

// Lazy cache for generated patterns
let _generatedPatterns: LanguagePattern[] | null = null;

/**
 * Get all generated patterns (lazy loaded).
 */
export function getGeneratedPatterns(): LanguagePattern[] {
  if (_generatedPatterns === null) {
    _generatedPatterns = generateAllCommandPatterns();
  }
  return _generatedPatterns;
}

// =============================================================================
// Lazy Pattern Building
// =============================================================================

/**
 * Build patterns for a specific language.
 * This is the core function for tree-shakeable pattern loading.
 */
export function buildPatternsForLanguage(language: string): LanguagePattern[] {
  const patterns: LanguagePattern[] = [];

  // 1. Hand-crafted patterns for this language
  patterns.push(...getTogglePatternsForLanguage(language));
  patterns.push(...getPutPatternsForLanguage(language));
  patterns.push(...getEventHandlerPatternsForLanguage(language));

  // 2. New multilingual command patterns (ja, ko, ar, tr, zh)
  patterns.push(...getAddPatternsForLanguage(language));
  patterns.push(...getRemovePatternsForLanguage(language));
  patterns.push(...getShowPatternsForLanguage(language));
  patterns.push(...getHidePatternsForLanguage(language));
  patterns.push(...getSetPatternsForLanguage(language));

  // 3. English-only hand-crafted patterns
  if (language === 'en') {
    patterns.push(...getEnglishOnlyPatterns());
  }

  // 4. Generated patterns for this language (lazy - ensures profiles are registered first)
  const langGeneratedPatterns = getGeneratedPatterns().filter(p => p.language === language);
  patterns.push(...langGeneratedPatterns);

  return patterns;
}

// Languages with hand-crafted patterns
const handcraftedLanguages = ['en', 'ja', 'ar', 'es', 'ko', 'zh', 'tr', 'pt', 'fr', 'de', 'id', 'qu', 'sw'];

/**
 * Build patterns for all languages.
 * @deprecated Use getPatternsForLanguage() for tree-shaking.
 */
export function buildAllPatterns(): LanguagePattern[] {
  const all: LanguagePattern[] = [];
  for (const lang of handcraftedLanguages) {
    all.push(...buildPatternsForLanguage(lang));
  }
  return all;
}

/**
 * Get list of all supported languages.
 */
export function getHandcraftedLanguages(): readonly string[] {
  return handcraftedLanguages;
}
