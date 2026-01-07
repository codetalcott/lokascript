/**
 * Decrement Command Patterns (Multilingual)
 *
 * Hand-crafted patterns for "decrement" command across languages.
 */

import type { LanguagePattern } from '../../types';

import { getDecrementPatternsDe } from './de';
import { getDecrementPatternsTr } from './tr';
import { getDecrementPatternsZh } from './zh';
import { getDecrementPatternsIt } from './it';
import { getDecrementPatternsVi } from './vi';
import { getDecrementPatternsPl } from './pl';
import { getDecrementPatternsRu } from './ru';
import { getDecrementPatternsUk } from './uk';
import { getDecrementPatternsHi } from './hi';
import { getDecrementPatternsBn } from './bn';
import { getDecrementPatternsTh } from './th';

/**
 * Get decrement patterns for a specific language.
 */
export function getDecrementPatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'de':
      return getDecrementPatternsDe();
    case 'tr':
      return getDecrementPatternsTr();
    case 'zh':
      return getDecrementPatternsZh();
    case 'it':
      return getDecrementPatternsIt();
    case 'vi':
      return getDecrementPatternsVi();
    case 'pl':
      return getDecrementPatternsPl();
    case 'ru':
      return getDecrementPatternsRu();
    case 'uk':
      return getDecrementPatternsUk();
    case 'hi':
      return getDecrementPatternsHi();
    case 'bn':
      return getDecrementPatternsBn();
    case 'th':
      return getDecrementPatternsTh();
    default:
      return [];
  }
}

// Re-export language-specific getters for tree-shaking
export { getDecrementPatternsDe } from './de';
export { getDecrementPatternsTr } from './tr';
export { getDecrementPatternsZh } from './zh';
export { getDecrementPatternsIt } from './it';
export { getDecrementPatternsVi } from './vi';
export { getDecrementPatternsPl } from './pl';
export { getDecrementPatternsRu } from './ru';
export { getDecrementPatternsUk } from './uk';
export { getDecrementPatternsHi } from './hi';
export { getDecrementPatternsBn } from './bn';
export { getDecrementPatternsTh } from './th';
