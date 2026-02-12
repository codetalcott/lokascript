/**
 * Increment Command Patterns
 *
 * Hand-crafted patterns for "increment" command across languages.
 *
 * @generated This file is auto-generated. Do not edit manually.
 */

import type { LanguagePattern } from '../../types';

import { getIncrementPatternsAr } from './ar';
import { getIncrementPatternsBn } from './bn';
import { getIncrementPatternsDe } from './de';
import { getIncrementPatternsEs } from './es';
import { getIncrementPatternsFr } from './fr';
import { getIncrementPatternsHi } from './hi';
import { getIncrementPatternsIt } from './it';
import { getIncrementPatternsJa } from './ja';
import { getIncrementPatternsKo } from './ko';
import { getIncrementPatternsPl } from './pl';
import { getIncrementPatternsRu } from './ru';
import { getIncrementPatternsTh } from './th';
import { getIncrementPatternsTr } from './tr';
import { getIncrementPatternsUk } from './uk';
import { getIncrementPatternsVi } from './vi';
import { getIncrementPatternsZh } from './zh';

/**
 * Get increment patterns for a specific language.
 */
export function getIncrementPatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'ar':
      return getIncrementPatternsAr();
    case 'bn':
      return getIncrementPatternsBn();
    case 'de':
      return getIncrementPatternsDe();
    case 'es':
      return getIncrementPatternsEs();
    case 'fr':
      return getIncrementPatternsFr();
    case 'hi':
      return getIncrementPatternsHi();
    case 'it':
      return getIncrementPatternsIt();
    case 'ja':
      return getIncrementPatternsJa();
    case 'ko':
      return getIncrementPatternsKo();
    case 'pl':
      return getIncrementPatternsPl();
    case 'ru':
      return getIncrementPatternsRu();
    case 'th':
      return getIncrementPatternsTh();
    case 'tr':
      return getIncrementPatternsTr();
    case 'uk':
      return getIncrementPatternsUk();
    case 'vi':
      return getIncrementPatternsVi();
    case 'zh':
      return getIncrementPatternsZh();
    default:
      return [];
  }
}

// Re-export language-specific getters for tree-shaking
export { getIncrementPatternsAr } from './ar';
export { getIncrementPatternsBn } from './bn';
export { getIncrementPatternsDe } from './de';
export { getIncrementPatternsEs } from './es';
export { getIncrementPatternsFr } from './fr';
export { getIncrementPatternsHi } from './hi';
export { getIncrementPatternsIt } from './it';
export { getIncrementPatternsJa } from './ja';
export { getIncrementPatternsKo } from './ko';
export { getIncrementPatternsPl } from './pl';
export { getIncrementPatternsRu } from './ru';
export { getIncrementPatternsTh } from './th';
export { getIncrementPatternsTr } from './tr';
export { getIncrementPatternsUk } from './uk';
export { getIncrementPatternsVi } from './vi';
export { getIncrementPatternsZh } from './zh';

/**
 * Languages that have hand-crafted increment patterns.
 */
export const incrementPatternLanguages = [
  'ar',
  'bn',
  'de',
  'es',
  'fr',
  'hi',
  'it',
  'ja',
  'ko',
  'pl',
  'ru',
  'th',
  'tr',
  'uk',
  'vi',
  'zh',
];
