/**
 * Trigger Command Patterns
 *
 * Hand-crafted patterns for "trigger" command across languages.
 *
 * @generated This file is auto-generated. Do not edit manually.
 */

import type { LanguagePattern } from '../../types';

import { getTriggerPatternsEn } from './en';
import { getTriggerPatternsJa } from './ja';
import { getTriggerPatternsKo } from './ko';
import { getTriggerPatternsEs } from './es';

/**
 * Get trigger patterns for a specific language.
 */
export function getTriggerPatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'en':
      return getTriggerPatternsEn();
    case 'ja':
      return getTriggerPatternsJa();
    case 'ko':
      return getTriggerPatternsKo();
    case 'es':
      return getTriggerPatternsEs();
    default:
      return [];
  }
}

// Re-export language-specific getters for tree-shaking
export { getTriggerPatternsEn } from './en';
export { getTriggerPatternsJa } from './ja';
export { getTriggerPatternsKo } from './ko';
export { getTriggerPatternsEs } from './es';
