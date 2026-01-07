/**
 * Put Patterns Index
 *
 * Re-exports per-language functions for tree-shaking.
 * Import specific languages directly for optimal bundle size.
 */

import type { LanguagePattern } from '../../types';

// Re-export per-language functions for direct import
export { getPutPatternsEn } from './en';
export { getPutPatternsJa } from './ja';
export { getPutPatternsAr } from './ar';
export { getPutPatternsEs } from './es';
export { getPutPatternsZh } from './zh';
export { getPutPatternsKo } from './ko';
export { getPutPatternsTr } from './tr';
export { getPutPatternsId } from './id';
export { getPutPatternsIt } from './it';
export { getPutPatternsVi } from './vi';
export { getPutPatternsPl } from './pl';
export { getPutPatternsRu } from './ru';
export { getPutPatternsUk } from './uk';
export { getPutPatternsHi } from './hi';
export { getPutPatternsBn } from './bn';
export { getPutPatternsTh } from './th';

// Import all for backwards compatibility (defeats tree-shaking)
import { getPutPatternsEn } from './en';
import { getPutPatternsJa } from './ja';
import { getPutPatternsAr } from './ar';
import { getPutPatternsEs } from './es';
import { getPutPatternsZh } from './zh';
import { getPutPatternsKo } from './ko';
import { getPutPatternsTr } from './tr';
import { getPutPatternsId } from './id';
import { getPutPatternsIt } from './it';
import { getPutPatternsVi } from './vi';
import { getPutPatternsPl } from './pl';
import { getPutPatternsRu } from './ru';
import { getPutPatternsUk } from './uk';
import { getPutPatternsHi } from './hi';
import { getPutPatternsBn } from './bn';
import { getPutPatternsTh } from './th';

/**
 * Get put patterns for a specific language.
 * Returns empty array if language has no hand-crafted patterns.
 *
 * @deprecated Import per-language functions directly for tree-shaking.
 */
export function getPutPatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'en': return getPutPatternsEn();
    case 'ja': return getPutPatternsJa();
    case 'ar': return getPutPatternsAr();
    case 'es': return getPutPatternsEs();
    case 'zh': return getPutPatternsZh();
    case 'ko': return getPutPatternsKo();
    case 'tr': return getPutPatternsTr();
    case 'id': return getPutPatternsId();
    case 'it': return getPutPatternsIt();
    case 'vi': return getPutPatternsVi();
    case 'pl': return getPutPatternsPl();
    case 'ru': return getPutPatternsRu();
    case 'uk': return getPutPatternsUk();
    case 'hi': return getPutPatternsHi();
    case 'bn': return getPutPatternsBn();
    case 'th': return getPutPatternsTh();
    default: return [];
  }
}
