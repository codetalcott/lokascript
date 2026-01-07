/**
 * Show Command Patterns
 *
 * Hand-crafted patterns for "show" command across languages.
 * Used for visibility: show #element
 */

import type { LanguagePattern } from '../../types';

import { getShowPatternsJa } from './ja';
import { getShowPatternsKo } from './ko';
import { getShowPatternsAr } from './ar';
import { getShowPatternsTr } from './tr';
import { getShowPatternsZh } from './zh';
import { getShowPatternsDe } from './de';
import { getShowPatternsFr } from './fr';
import { getShowPatternsIt } from './it';
import { getShowPatternsVi } from './vi';
import { getShowPatternsPl } from './pl';
import { getShowPatternsRu } from './ru';
import { getShowPatternsUk } from './uk';
import { getShowPatternsHi } from './hi';
import { getShowPatternsBn } from './bn';
import { getShowPatternsTh } from './th';

/**
 * Get show patterns for a specific language.
 */
export function getShowPatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'ja':
      return getShowPatternsJa();
    case 'ko':
      return getShowPatternsKo();
    case 'ar':
      return getShowPatternsAr();
    case 'tr':
      return getShowPatternsTr();
    case 'zh':
      return getShowPatternsZh();
    case 'de':
      return getShowPatternsDe();
    case 'fr':
      return getShowPatternsFr();
    case 'it':
      return getShowPatternsIt();
    case 'vi':
      return getShowPatternsVi();
    case 'pl':
      return getShowPatternsPl();
    case 'ru':
      return getShowPatternsRu();
    case 'uk':
      return getShowPatternsUk();
    case 'hi':
      return getShowPatternsHi();
    case 'bn':
      return getShowPatternsBn();
    case 'th':
      return getShowPatternsTh();
    default:
      return [];
  }
}

// Re-export language-specific getters for tree-shaking
export { getShowPatternsJa } from './ja';
export { getShowPatternsKo } from './ko';
export { getShowPatternsAr } from './ar';
export { getShowPatternsTr } from './tr';
export { getShowPatternsZh } from './zh';
export { getShowPatternsDe } from './de';
export { getShowPatternsFr } from './fr';
export { getShowPatternsIt } from './it';
export { getShowPatternsVi } from './vi';
export { getShowPatternsPl } from './pl';
export { getShowPatternsRu } from './ru';
export { getShowPatternsUk } from './uk';
export { getShowPatternsHi } from './hi';
export { getShowPatternsBn } from './bn';
export { getShowPatternsTh } from './th';
