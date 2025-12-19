/**
 * Event Handler Patterns Index
 *
 * Re-exports per-language functions for tree-shaking.
 * Import specific languages directly for optimal bundle size.
 */

import type { LanguagePattern } from '../../types';

// Re-export shared utilities
export { eventNameTranslations, normalizeEventName } from './shared';

// Re-export per-language functions for direct import
export { getEventHandlerPatternsEn } from './en';
export { getEventHandlerPatternsJa } from './ja';
export { getEventHandlerPatternsKo } from './ko';
export { getEventHandlerPatternsAr } from './ar';
export { getEventHandlerPatternsTr } from './tr';
export { getEventHandlerPatternsEs } from './es';
export { getEventHandlerPatternsPt } from './pt';
export { getEventHandlerPatternsZh } from './zh';
export { getEventHandlerPatternsFr } from './fr';
export { getEventHandlerPatternsDe } from './de';
export { getEventHandlerPatternsId } from './id';
export { getEventHandlerPatternsQu } from './qu';
export { getEventHandlerPatternsSw } from './sw';

// Import all for backwards compatibility (defeats tree-shaking)
import { getEventHandlerPatternsEn } from './en';
import { getEventHandlerPatternsJa } from './ja';
import { getEventHandlerPatternsKo } from './ko';
import { getEventHandlerPatternsAr } from './ar';
import { getEventHandlerPatternsTr } from './tr';
import { getEventHandlerPatternsEs } from './es';
import { getEventHandlerPatternsPt } from './pt';
import { getEventHandlerPatternsZh } from './zh';
import { getEventHandlerPatternsFr } from './fr';
import { getEventHandlerPatternsDe } from './de';
import { getEventHandlerPatternsId } from './id';
import { getEventHandlerPatternsQu } from './qu';
import { getEventHandlerPatternsSw } from './sw';

/**
 * Get event handler patterns for a specific language.
 * Returns empty array if language has no hand-crafted patterns.
 *
 * @deprecated Import per-language functions directly for tree-shaking.
 */
export function getEventHandlerPatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'en': return getEventHandlerPatternsEn();
    case 'ja': return getEventHandlerPatternsJa();
    case 'ko': return getEventHandlerPatternsKo();
    case 'ar': return getEventHandlerPatternsAr();
    case 'tr': return getEventHandlerPatternsTr();
    case 'es': return getEventHandlerPatternsEs();
    case 'pt': return getEventHandlerPatternsPt();
    case 'zh': return getEventHandlerPatternsZh();
    case 'fr': return getEventHandlerPatternsFr();
    case 'de': return getEventHandlerPatternsDe();
    case 'id': return getEventHandlerPatternsId();
    case 'qu': return getEventHandlerPatternsQu();
    case 'sw': return getEventHandlerPatternsSw();
    default: return [];
  }
}

/**
 * All event handler patterns across all languages.
 * @deprecated Use per-language imports for tree-shaking.
 */
export const eventHandlerPatterns: LanguagePattern[] = [
  ...getEventHandlerPatternsEn(),
  ...getEventHandlerPatternsJa(),
  ...getEventHandlerPatternsKo(),
  ...getEventHandlerPatternsAr(),
  ...getEventHandlerPatternsTr(),
  ...getEventHandlerPatternsEs(),
  ...getEventHandlerPatternsPt(),
  ...getEventHandlerPatternsZh(),
  ...getEventHandlerPatternsFr(),
  ...getEventHandlerPatternsDe(),
  ...getEventHandlerPatternsId(),
  ...getEventHandlerPatternsQu(),
  ...getEventHandlerPatternsSw(),
];
