/**
 * Set Command Patterns (Multilingual)
 *
 * Hand-crafted patterns for "set" command across languages.
 * Used for variable assignment: set x to 5
 *
 * Note: English patterns are in languages/en/set.ts and handled separately.
 */

import type { LanguagePattern } from '../../types';

import { getSetPatternsJa } from './ja';
import { getSetPatternsKo } from './ko';
import { getSetPatternsAr } from './ar';
import { getSetPatternsTr } from './tr';
import { getSetPatternsZh } from './zh';

/**
 * Get set patterns for a specific language.
 */
export function getSetPatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'ja':
      return getSetPatternsJa();
    case 'ko':
      return getSetPatternsKo();
    case 'ar':
      return getSetPatternsAr();
    case 'tr':
      return getSetPatternsTr();
    case 'zh':
      return getSetPatternsZh();
    default:
      return [];
  }
}

// Re-export language-specific getters for tree-shaking
export { getSetPatternsJa } from './ja';
export { getSetPatternsKo } from './ko';
export { getSetPatternsAr } from './ar';
export { getSetPatternsTr } from './tr';
export { getSetPatternsZh } from './zh';
