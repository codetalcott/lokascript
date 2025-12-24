/**
 * English-Only Patterns
 *
 * Re-exports all English-specific hand-crafted patterns.
 * These patterns are only included when English is the target language.
 */

import type { LanguagePattern } from '../../../types';

import { fetchPatternsEn } from './fetch';
import { swapPatternsEn } from './swap';
import { repeatPatternsEn } from './repeat';
import { setPatternsEn } from './set';
import { controlFlowPatternsEn } from './control-flow';
import { temporalPatternsEn } from './temporal';

// Re-export individual pattern arrays for selective imports
export { fetchPatternsEn } from './fetch';
export { swapPatternsEn } from './swap';
export { repeatPatternsEn } from './repeat';
export { setPatternsEn } from './set';
export { controlFlowPatternsEn } from './control-flow';
export { temporalPatternsEn } from './temporal';

/**
 * All English-only hand-crafted patterns combined.
 */
export const allEnglishOnlyPatterns: LanguagePattern[] = [
  ...fetchPatternsEn,
  ...swapPatternsEn,
  ...repeatPatternsEn,
  ...setPatternsEn,
  ...controlFlowPatternsEn,
  ...temporalPatternsEn,
];

/**
 * Get all English-only hand-crafted patterns.
 */
export function getEnglishOnlyPatterns(): LanguagePattern[] {
  return allEnglishOnlyPatterns;
}
