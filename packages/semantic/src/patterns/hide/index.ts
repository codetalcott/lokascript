/**
 * Hide Command Patterns
 *
 * Hand-crafted patterns for "hide" command across languages.
 * Used for visibility: hide #element
 */

import type { LanguagePattern } from '../../types';

import { getHidePatternsJa } from './ja';
import { getHidePatternsKo } from './ko';
import { getHidePatternsAr } from './ar';
import { getHidePatternsTr } from './tr';
import { getHidePatternsZh } from './zh';
import { getHidePatternsDe } from './de';
import { getHidePatternsIt } from './it';
import { getHidePatternsVi } from './vi';
import { getHidePatternsPl } from './pl';
import { getHidePatternsRu } from './ru';
import { getHidePatternsUk } from './uk';
import { getHidePatternsHi } from './hi';
import { getHidePatternsBn } from './bn';
import { getHidePatternsTh } from './th';

/**
 * Get hide patterns for a specific language.
 */
export function getHidePatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'ja':
      return getHidePatternsJa();
    case 'ko':
      return getHidePatternsKo();
    case 'ar':
      return getHidePatternsAr();
    case 'tr':
      return getHidePatternsTr();
    case 'zh':
      return getHidePatternsZh();
    case 'de':
      return getHidePatternsDe();
    case 'it':
      return getHidePatternsIt();
    case 'vi':
      return getHidePatternsVi();
    case 'pl':
      return getHidePatternsPl();
    case 'ru':
      return getHidePatternsRu();
    case 'uk':
      return getHidePatternsUk();
    case 'hi':
      return getHidePatternsHi();
    case 'bn':
      return getHidePatternsBn();
    case 'th':
      return getHidePatternsTh();
    default:
      return [];
  }
}

// Re-export language-specific getters for tree-shaking
export { getHidePatternsJa } from './ja';
export { getHidePatternsKo } from './ko';
export { getHidePatternsAr } from './ar';
export { getHidePatternsTr } from './tr';
export { getHidePatternsZh } from './zh';
export { getHidePatternsDe } from './de';
export { getHidePatternsIt } from './it';
export { getHidePatternsVi } from './vi';
export { getHidePatternsPl } from './pl';
export { getHidePatternsRu } from './ru';
export { getHidePatternsUk } from './uk';
export { getHidePatternsHi } from './hi';
export { getHidePatternsBn } from './bn';
export { getHidePatternsTh } from './th';
