/**
 * Increment Command Patterns (Multilingual)
 *
 * Hand-crafted patterns for "increment" command across languages.
 */

import type { LanguagePattern } from '../../types';

import { getIncrementPatternsDe } from './de';
import { getIncrementPatternsTr } from './tr';
import { getIncrementPatternsZh } from './zh';
import { getIncrementPatternsIt } from './it';
import { getIncrementPatternsVi } from './vi';
import { getIncrementPatternsPl } from './pl';
import { getIncrementPatternsRu } from './ru';
import { getIncrementPatternsUk } from './uk';
import { getIncrementPatternsHi } from './hi';
import { getIncrementPatternsBn } from './bn';
import { getIncrementPatternsTh } from './th';

/**
 * Get increment patterns for a specific language.
 */
export function getIncrementPatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'de':
      return getIncrementPatternsDe();
    case 'tr':
      return getIncrementPatternsTr();
    case 'zh':
      return getIncrementPatternsZh();
    case 'it':
      return getIncrementPatternsIt();
    case 'vi':
      return getIncrementPatternsVi();
    case 'pl':
      return getIncrementPatternsPl();
    case 'ru':
      return getIncrementPatternsRu();
    case 'uk':
      return getIncrementPatternsUk();
    case 'hi':
      return getIncrementPatternsHi();
    case 'bn':
      return getIncrementPatternsBn();
    case 'th':
      return getIncrementPatternsTh();
    default:
      return [];
  }
}

// Re-export language-specific getters for tree-shaking
export { getIncrementPatternsDe } from './de';
export { getIncrementPatternsTr } from './tr';
export { getIncrementPatternsZh } from './zh';
export { getIncrementPatternsIt } from './it';
export { getIncrementPatternsVi } from './vi';
export { getIncrementPatternsPl } from './pl';
export { getIncrementPatternsRu } from './ru';
export { getIncrementPatternsUk } from './uk';
export { getIncrementPatternsHi } from './hi';
export { getIncrementPatternsBn } from './bn';
export { getIncrementPatternsTh } from './th';
