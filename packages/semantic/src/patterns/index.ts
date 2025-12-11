/**
 * Pattern Registry
 *
 * Central registry for all language patterns.
 * Provides lookup by language and command type.
 */

import type { LanguagePattern, ActionType } from '../types';
import { togglePatterns, getTogglePatternsForLanguage } from './toggle';
import { putPatterns, getPutPatternsForLanguage } from './put';
import { eventHandlerPatterns, getEventHandlerPatternsForLanguage, eventNameTranslations, normalizeEventName } from './event-handler';

// =============================================================================
// All Patterns
// =============================================================================

/**
 * All registered patterns across all languages.
 */
export const allPatterns: LanguagePattern[] = [
  ...togglePatterns,
  ...putPatterns,
  ...eventHandlerPatterns,
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
