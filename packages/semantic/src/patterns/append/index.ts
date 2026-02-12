/**
 * Append Command Patterns
 *
 * Hand-crafted patterns for "append" command across languages.
 *
 * @generated This file is auto-generated. Do not edit manually.
 */

import type { LanguagePattern } from '../../types';

import { getAppendPatternsEn } from './en';
import { getAppendPatternsJa } from './ja';
import { getAppendPatternsKo } from './ko';
import { getAppendPatternsEs } from './es';

/**
 * Get append patterns for a specific language.
 */
export function getAppendPatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'en':
      return getAppendPatternsEn();
    case 'ja':
      return getAppendPatternsJa();
    case 'ko':
      return getAppendPatternsKo();
    case 'es':
      return getAppendPatternsEs();
    default:
      return [];
  }
}

// Re-export language-specific getters for tree-shaking
export { getAppendPatternsEn } from './en';
export { getAppendPatternsJa } from './ja';
export { getAppendPatternsKo } from './ko';
export { getAppendPatternsEs } from './es';
