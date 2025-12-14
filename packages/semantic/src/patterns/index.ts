/**
 * Pattern Registry
 *
 * Central registry for all language patterns.
 * Provides lookup by language and command type.
 *
 * Migration Strategy:
 * - Hand-crafted patterns: toggle, put, event-handler (validated, keep)
 * - Generated patterns: add, remove, show, hide, wait, log, etc. (new)
 */

import type { LanguagePattern, ActionType } from '../types';
import { togglePatterns, getTogglePatternsForLanguage } from './toggle';
import { putPatterns, getPutPatternsForLanguage } from './put';
import { eventHandlerPatterns, getEventHandlerPatternsForLanguage, eventNameTranslations, normalizeEventName } from './event-handler';

// Import generator for new commands
import {
  generatePatternsForCommand,
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
} from '../generators';

// =============================================================================
// Hand-crafted Fetch Simple Pattern (English only)
// =============================================================================

/**
 * English: "fetch /url as json" with response type.
 * This pattern has higher priority to capture the "as json" modifier.
 */
const fetchWithResponseTypeEnglish: LanguagePattern = {
  id: 'fetch-en-with-response-type',
  language: 'en',
  command: 'fetch',
  priority: 90, // Higher than simple pattern (80) to capture "as" modifier first
  template: {
    format: 'fetch {source} as {responseType}',
    tokens: [
      { type: 'literal', value: 'fetch' },
      { type: 'role', role: 'source', expectedTypes: ['literal', 'expression'] },
      { type: 'literal', value: 'as' },
      // json/text/html are identifiers not keywords, so we need to accept 'expression' type
      { type: 'role', role: 'responseType', expectedTypes: ['literal', 'expression'] },
    ],
  },
  extraction: {
    source: { position: 1 },
    responseType: { marker: 'as' },
  },
};

/**
 * English: "fetch /url" without "from" preposition.
 * Official hyperscript allows bare URL without "from".
 * Lower priority so it's tried after the response type pattern.
 */
const fetchSimpleEnglish: LanguagePattern = {
  id: 'fetch-en-simple',
  language: 'en',
  command: 'fetch',
  priority: 80, // Lower than response type pattern (90) - fallback when "as" not present
  template: {
    format: 'fetch {source}',
    tokens: [
      { type: 'literal', value: 'fetch' },
      { type: 'role', role: 'source' },
    ],
  },
  extraction: {
    source: { position: 1 },
  },
};

// =============================================================================
// Hand-crafted Swap Pattern (English only)
// =============================================================================

/**
 * English: "swap <strategy> <target>" without prepositions.
 * Examples:
 * - swap delete #item
 * - swap innerHTML #target
 * - swap outerHTML me
 */
const swapSimpleEnglish: LanguagePattern = {
  id: 'swap-en-handcrafted',
  language: 'en',
  command: 'swap',
  priority: 110, // Higher than generated patterns
  template: {
    format: 'swap {method} {destination}',
    tokens: [
      { type: 'literal', value: 'swap' },
      { type: 'role', role: 'method' },
      { type: 'role', role: 'destination' },
    ],
  },
  extraction: {
    method: { position: 1 },
    destination: { position: 2 },
  },
};

// =============================================================================
// Hand-crafted Repeat Until Event Patterns (English only)
// =============================================================================

/**
 * English: "repeat until event pointerup from document"
 * Full form with event source specification.
 * Higher priority to capture the complete "until event X from Y" syntax.
 */
const repeatUntilEventFromEnglish: LanguagePattern = {
  id: 'repeat-en-until-event-from',
  language: 'en',
  command: 'repeat',
  priority: 120, // Highest priority - most specific pattern
  template: {
    format: 'repeat until event {event} from {source}',
    tokens: [
      { type: 'literal', value: 'repeat' },
      { type: 'literal', value: 'until' },
      { type: 'literal', value: 'event' },
      { type: 'role', role: 'event', expectedTypes: ['literal', 'expression'] },
      { type: 'literal', value: 'from' },
      { type: 'role', role: 'source', expectedTypes: ['selector', 'reference', 'expression'] },
    ],
  },
  extraction: {
    event: { marker: 'event' },
    source: { marker: 'from' },
  },
};

/**
 * English: "repeat until event pointerup"
 * Simple event termination without source.
 */
const repeatUntilEventEnglish: LanguagePattern = {
  id: 'repeat-en-until-event',
  language: 'en',
  command: 'repeat',
  priority: 110, // Lower than "from" variant, but higher than quantity-based repeat
  template: {
    format: 'repeat until event {event}',
    tokens: [
      { type: 'literal', value: 'repeat' },
      { type: 'literal', value: 'until' },
      { type: 'literal', value: 'event' },
      { type: 'role', role: 'event', expectedTypes: ['literal', 'expression'] },
    ],
  },
  extraction: {
    event: { marker: 'event' },
  },
};

// =============================================================================
// Generated Patterns (New Commands)
// =============================================================================

/**
 * Commands using generated patterns.
 * These don't have hand-crafted patterns, so we generate them.
 */
const generatedPatterns: LanguagePattern[] = [
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

// =============================================================================
// All Patterns
// =============================================================================

/**
 * All registered patterns across all languages.
 * Combines hand-crafted (validated) with generated (new).
 */
export const allPatterns: LanguagePattern[] = [
  // Hand-crafted patterns (validated, higher priority)
  ...togglePatterns,
  ...putPatterns,
  ...eventHandlerPatterns,
  fetchWithResponseTypeEnglish, // fetch /url as json (higher priority)
  fetchSimpleEnglish, // fetch /url without "from" (lower priority)
  swapSimpleEnglish,  // swap <strategy> <target>
  repeatUntilEventFromEnglish, // repeat until event X from Y (highest priority)
  repeatUntilEventEnglish, // repeat until event X (lower priority)
  // Generated patterns (new commands)
  ...generatedPatterns,
];

// =============================================================================
// Pattern Lookup
// =============================================================================

/**
 * Get all patterns for a specific language.
 */
export function getPatternsForLanguage(language: string): LanguagePattern[] {
  return allPatterns.filter(p => p.language === language);
}

/**
 * Get patterns for a specific language and command.
 */
export function getPatternsForLanguageAndCommand(
  language: string,
  command: ActionType
): LanguagePattern[] {
  return allPatterns
    .filter(p => p.language === language && p.command === command)
    .sort((a, b) => b.priority - a.priority); // Sort by priority descending
}

/**
 * Get all supported languages.
 */
export function getSupportedLanguages(): string[] {
  const languages = new Set(allPatterns.map(p => p.language));
  return Array.from(languages);
}

/**
 * Get all supported commands.
 */
export function getSupportedCommands(): ActionType[] {
  const commands = new Set(allPatterns.map(p => p.command));
  return Array.from(commands) as ActionType[];
}

/**
 * Find a pattern by ID.
 */
export function getPatternById(id: string): LanguagePattern | undefined {
  return allPatterns.find(p => p.id === id);
}

// =============================================================================
// Pattern Statistics (for debugging/tooling)
// =============================================================================

export interface PatternStats {
  totalPatterns: number;
  byLanguage: Record<string, number>;
  byCommand: Record<string, number>;
}

/**
 * Get statistics about registered patterns.
 */
export function getPatternStats(): PatternStats {
  const byLanguage: Record<string, number> = {};
  const byCommand: Record<string, number> = {};

  for (const pattern of allPatterns) {
    byLanguage[pattern.language] = (byLanguage[pattern.language] || 0) + 1;
    byCommand[pattern.command] = (byCommand[pattern.command] || 0) + 1;
  }

  return {
    totalPatterns: allPatterns.length,
    byLanguage,
    byCommand,
  };
}

// =============================================================================
// Re-exports
// =============================================================================

export {
  togglePatterns,
  getTogglePatternsForLanguage,
  putPatterns,
  getPutPatternsForLanguage,
  eventHandlerPatterns,
  getEventHandlerPatternsForLanguage,
  eventNameTranslations,
  normalizeEventName,
};
