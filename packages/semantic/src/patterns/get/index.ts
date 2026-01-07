/**
 * Get Command Patterns (Multilingual)
 *
 * Hand-crafted patterns for "get" command across languages.
 */

import type { LanguagePattern } from '../../types';

import { getGetPatternsDe } from './de';
import { getGetPatternsJa } from './ja';
import { getGetPatternsKo } from './ko';
import { getGetPatternsAr } from './ar';
import { getGetPatternsIt } from './it';
import { getGetPatternsVi } from './vi';
import { getGetPatternsPl } from './pl';
import { getGetPatternsRu } from './ru';
import { getGetPatternsUk } from './uk';
import { getGetPatternsHi } from './hi';
import { getGetPatternsBn } from './bn';
import { getGetPatternsTh } from './th';

/**
 * Get get patterns for a specific language.
 */
export function getGetPatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'de':
      return getGetPatternsDe();
    case 'ja':
      return getGetPatternsJa();
    case 'ko':
      return getGetPatternsKo();
    case 'ar':
      return getGetPatternsAr();
    case 'it':
      return getGetPatternsIt();
    case 'vi':
      return getGetPatternsVi();
    case 'pl':
      return getGetPatternsPl();
    case 'ru':
      return getGetPatternsRu();
    case 'uk':
      return getGetPatternsUk();
    case 'hi':
      return getGetPatternsHi();
    case 'bn':
      return getGetPatternsBn();
    case 'th':
      return getGetPatternsTh();
    default:
      return [];
  }
}

// Re-export language-specific getters for tree-shaking
export { getGetPatternsDe } from './de';
export { getGetPatternsJa } from './ja';
export { getGetPatternsKo } from './ko';
export { getGetPatternsAr } from './ar';
export { getGetPatternsIt } from './it';
export { getGetPatternsVi } from './vi';
export { getGetPatternsPl } from './pl';
export { getGetPatternsRu } from './ru';
export { getGetPatternsUk } from './uk';
export { getGetPatternsHi } from './hi';
export { getGetPatternsBn } from './bn';
export { getGetPatternsTh } from './th';
