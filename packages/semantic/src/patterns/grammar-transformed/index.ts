/**
 * GrammarTransformed Command Patterns
 *
 * Hand-crafted patterns for "grammar-transformed" command across languages.
 *
 * @generated This file is auto-generated. Do not edit manually.
 */

import type { LanguagePattern } from '../../types';

import { getGrammarTransformedPatternsJa } from './ja';
import { getGrammarTransformedPatternsKo } from './ko';
import { getGrammarTransformedPatternsTr } from './tr';

/**
 * Get grammar-transformed patterns for a specific language.
 */
export function getGrammarTransformedPatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'ja':
      return getGrammarTransformedPatternsJa();
    case 'ko':
      return getGrammarTransformedPatternsKo();
    case 'tr':
      return getGrammarTransformedPatternsTr();
    default:
      return [];
  }
}

// Re-export language-specific getters for tree-shaking
export { getGrammarTransformedPatternsJa } from './ja';
export { getGrammarTransformedPatternsKo } from './ko';
export { getGrammarTransformedPatternsTr } from './tr';

/**
 * Languages that have hand-crafted grammar-transformed patterns.
 */
export const grammartransformedPatternLanguages = ['ja', 'ko', 'tr'];
