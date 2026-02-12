/**
 * Prepend Command Patterns
 *
 * Hand-crafted patterns for "prepend" command across languages.
 *
 * @generated This file is auto-generated. Do not edit manually.
 */

import type { LanguagePattern } from '../../types';

import { getPrependPatternsEn } from './en';
import { getPrependPatternsJa } from './ja';
import { getPrependPatternsKo } from './ko';
import { getPrependPatternsEs } from './es';

/**
 * Get prepend patterns for a specific language.
 */
export function getPrependPatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'en':
      return getPrependPatternsEn();
    case 'ja':
      return getPrependPatternsJa();
    case 'ko':
      return getPrependPatternsKo();
    case 'es':
      return getPrependPatternsEs();
    default:
      return [];
  }
}

// Re-export language-specific getters for tree-shaking
export { getPrependPatternsEn } from './en';
export { getPrependPatternsJa } from './ja';
export { getPrependPatternsKo } from './ko';
export { getPrependPatternsEs } from './es';
