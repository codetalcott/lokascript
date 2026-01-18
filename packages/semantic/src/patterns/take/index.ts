/**
 * Take Command Patterns
 *
 * Hand-crafted patterns for "take" command across languages.
 *
 * @generated This file is auto-generated. Do not edit manually.
 */

import type { LanguagePattern } from '../../types';

import { getTakePatternsAr } from './ar';

/**
 * Get take patterns for a specific language.
 */
export function getTakePatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'ar':
      return getTakePatternsAr();
    default:
      return [];
  }
}

// Re-export language-specific getters for tree-shaking
export { getTakePatternsAr } from './ar';

/**
 * Languages that have hand-crafted take patterns.
 */
export const takePatternLanguages = ['ar'];
