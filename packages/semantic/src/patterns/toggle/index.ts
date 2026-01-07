/**
 * Toggle Patterns Index
 *
 * Re-exports per-language functions for tree-shaking.
 * Import specific languages directly for optimal bundle size.
 */

import type { LanguagePattern } from '../../types';

// Re-export per-language functions for direct import
export { getTogglePatternsEn } from './en';
export { getTogglePatternsJa } from './ja';
export { getTogglePatternsAr } from './ar';
export { getTogglePatternsEs } from './es';
export { getTogglePatternsKo } from './ko';
export { getTogglePatternsZh } from './zh';
export { getTogglePatternsTr } from './tr';
export { getTogglePatternsIt } from './it';
export { getTogglePatternsVi } from './vi';
export { getTogglePatternsPl } from './pl';
export { getTogglePatternsRu } from './ru';
export { getTogglePatternsUk } from './uk';
export { getTogglePatternsHi } from './hi';
export { getTogglePatternsBn } from './bn';
export { getTogglePatternsTh } from './th';

// Import all for backwards compatibility (defeats tree-shaking)
import { getTogglePatternsEn } from './en';
import { getTogglePatternsJa } from './ja';
import { getTogglePatternsAr } from './ar';
import { getTogglePatternsEs } from './es';
import { getTogglePatternsKo } from './ko';
import { getTogglePatternsZh } from './zh';
import { getTogglePatternsTr } from './tr';
import { getTogglePatternsIt } from './it';
import { getTogglePatternsVi } from './vi';
import { getTogglePatternsPl } from './pl';
import { getTogglePatternsRu } from './ru';
import { getTogglePatternsUk } from './uk';
import { getTogglePatternsHi } from './hi';
import { getTogglePatternsBn } from './bn';
import { getTogglePatternsTh } from './th';

/**
 * Get toggle patterns for a specific language.
 * Returns empty array if language has no hand-crafted patterns.
 *
 * @deprecated Import per-language functions directly for tree-shaking.
 */
export function getTogglePatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'en': return getTogglePatternsEn();
    case 'ja': return getTogglePatternsJa();
    case 'ar': return getTogglePatternsAr();
    case 'es': return getTogglePatternsEs();
    case 'ko': return getTogglePatternsKo();
    case 'zh': return getTogglePatternsZh();
    case 'tr': return getTogglePatternsTr();
    case 'it': return getTogglePatternsIt();
    case 'vi': return getTogglePatternsVi();
    case 'pl': return getTogglePatternsPl();
    case 'ru': return getTogglePatternsRu();
    case 'uk': return getTogglePatternsUk();
    case 'hi': return getTogglePatternsHi();
    case 'bn': return getTogglePatternsBn();
    case 'th': return getTogglePatternsTh();
    default: return [];
  }
}

/**
 * Languages that have hand-crafted toggle patterns.
 */
export const togglePatternLanguages = ['en', 'ja', 'ar', 'es', 'ko', 'zh', 'tr', 'it', 'vi', 'pl', 'ru', 'uk', 'hi', 'bn', 'th'];
