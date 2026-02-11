/**
 * Tagalog Morphological Normalizer
 *
 * Tagalog uses a focus-based affixation system where affixes indicate
 * the grammatical focus (subject/actor vs patient/object/location).
 * This normalizer strips verbal affixes to extract root forms.
 *
 * Key features:
 * - Actor focus: mag- (completed), -um- (infix), nag- (past)
 * - Object focus: i-, ipag-, ipang-
 * - Patient focus: -in, -hin
 * - Locative focus: -an, -han
 * - Causative: pa-, magpa-
 * - Reduplication handling (partial and full)
 *
 * Tagalog verb structure:
 *   [prefix]-[infix]-ROOT[-suffix]
 *
 * Examples:
 *   magtoggle → toggle (mag- actor focus)
 *   itoggle → toggle (i- object focus)
 *   togglein → toggle (-in patient focus)
 *   togglean → toggle (-an locative focus)
 *   nagtoggle → toggle (nag- past actor focus)
 */

import type { MorphologicalNormalizer, NormalizationResult, PrefixRule } from './types';
import { noChange, normalized } from './types';

/**
 * Check if a character is a Tagalog letter.
 * Tagalog uses Latin alphabet with Spanish influence (ñ).
 */
function isTagalogLetter(char: string): boolean {
  const code = char.charCodeAt(0);
  // Basic Latin letters
  if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)) {
    return true;
  }
  // Spanish ñ (sometimes used in borrowed words)
  return char === 'ñ' || char === 'Ñ';
}

/**
 * Check if a word contains Tagalog characters.
 */
function containsTagalog(word: string): boolean {
  for (const char of word) {
    if (isTagalogLetter(char)) return true;
  }
  return false;
}

/**
 * Prefix rules for Tagalog, ordered by priority.
 * Combined/longer prefixes should be checked first.
 */
const COMBINED_PREFIXES: readonly PrefixRule[] = [
  // Causative combinations (5-6 chars)
  { pattern: 'magpapa', confidencePenalty: 0.15, prefixType: 'verb-marker', minRemaining: 3 }, // magpa- + reduplication
  { pattern: 'magpa', confidencePenalty: 0.15, prefixType: 'verb-marker', minRemaining: 3 }, // causative actor focus
  { pattern: 'ipang', confidencePenalty: 0.15, prefixType: 'verb-marker', minRemaining: 3 }, // object focus + ligature
  { pattern: 'ipag', confidencePenalty: 0.15, prefixType: 'verb-marker', minRemaining: 3 }, // benefactive object focus
  { pattern: 'nagpa', confidencePenalty: 0.15, prefixType: 'verb-marker', minRemaining: 3 }, // past causative actor focus
];

/**
 * Single prefix rules for Tagalog.
 * Actor focus, object focus, and causative markers.
 */
const SINGLE_PREFIXES: readonly PrefixRule[] = [
  // Actor focus markers (3 chars)
  { pattern: 'mag', confidencePenalty: 0.15, prefixType: 'verb-marker', minRemaining: 3 }, // actor focus
  { pattern: 'nag', confidencePenalty: 0.15, prefixType: 'verb-marker', minRemaining: 3 }, // past actor focus
  { pattern: 'mang', confidencePenalty: 0.15, prefixType: 'verb-marker', minRemaining: 3 }, // actor focus (with assimilation)
  { pattern: 'nang', confidencePenalty: 0.15, prefixType: 'verb-marker', minRemaining: 3 }, // past actor focus (with assimilation)

  // Object focus markers (2 chars)
  { pattern: 'ma', confidencePenalty: 0.12, prefixType: 'verb-marker', minRemaining: 3 }, // stative/abilitative
  { pattern: 'na', confidencePenalty: 0.12, prefixType: 'verb-marker', minRemaining: 3 }, // past stative

  // Object focus marker (1 char)
  { pattern: 'i', confidencePenalty: 0.15, prefixType: 'verb-marker', minRemaining: 3 }, // object focus

  // Causative marker (2 chars)
  { pattern: 'pa', confidencePenalty: 0.12, prefixType: 'verb-marker', minRemaining: 3 }, // causative
];

/**
 * Infix patterns (-um-, -in-).
 * These appear after the first consonant of the root.
 * Example: sulat → sumulat (write → wrote/will write)
 */
const INFIXES = ['um', 'in'] as const;

/**
 * Suffix rules for Tagalog.
 * Patient focus and locative focus markers.
 */
const SUFFIXES: readonly { pattern: string; confidencePenalty: number; type: string }[] = [
  // Patient focus (-in, -hin after vowel)
  { pattern: 'hin', confidencePenalty: 0.18, type: 'patient-focus' },
  { pattern: 'in', confidencePenalty: 0.18, type: 'patient-focus' },

  // Locative focus (-an, -han after vowel)
  { pattern: 'han', confidencePenalty: 0.18, type: 'locative-focus' },
  { pattern: 'an', confidencePenalty: 0.18, type: 'locative-focus' },
];

/**
 * Try to strip infix from a word.
 * Infixes appear after the first consonant or consonant cluster.
 *
 * Examples:
 *   sumulat → s + um + ulat → sulat
 *   kumain → k + um + ain → kain
 *   binili → b + in + ili → bili
 */
function stripInfix(word: string): { stem: string; infix: string } | null {
  const lower = word.toLowerCase();

  // Need at least 5 characters for meaningful infix (C + infix + root)
  if (lower.length < 5) return null;

  // Find the first consonant(s)
  let consonantEnd = 0;
  for (let i = 0; i < lower.length; i++) {
    const char = lower[i];
    if (!'aeiou'.includes(char)) {
      consonantEnd = i + 1;
    } else {
      break; // Stop at first vowel
    }
  }

  // No consonants found, can't have infix
  if (consonantEnd === 0) return null;

  // Check if an infix follows the consonant(s)
  for (const infix of INFIXES) {
    const expectedInfixPos = consonantEnd;
    if (lower.slice(expectedInfixPos, expectedInfixPos + infix.length) === infix) {
      // Found infix - reconstruct root
      const stem = lower.slice(0, consonantEnd) + lower.slice(expectedInfixPos + infix.length);

      // Ensure we don't create an invalid stem (too short after reconstruction)
      if (stem.length >= 3) {
        return { stem, infix };
      }
    }
  }

  return null;
}

/**
 * Check for partial reduplication (CV- reduplication).
 * Example: tatoggle → toggle (ta- is reduplication of first CV of "toggle")
 * Example: susulat → sulat (su- is reduplication of first CV of "sulat")
 *
 * In Tagalog, the first CV of the root is reduplicated as a prefix.
 * So we need to check if the first 2 chars match the CV pattern of what follows.
 */
function stripReduplication(word: string): { stem: string; reduplicated: boolean } {
  const lower = word.toLowerCase();

  // Tagalog often reduplicates the first CV syllable (consonant-vowel)
  // Example: sulat → susulat (partial reduplication for progressive/future)
  if (lower.length < 4) return { stem: lower, reduplicated: false };

  // Extract first CV (consonant + vowel)
  const firstChar = lower[0];
  const secondChar = lower[1];

  // Check if it's CV pattern (consonant + vowel)
  if (!'aeiou'.includes(firstChar) && 'aeiou'.includes(secondChar)) {
    const remaining = lower.slice(2);

    // Check if remaining starts with the same consonant
    // (The vowel might differ, e.g., "tatoggle" → "ta" + "toggle", where "to" starts with 't')
    if (remaining.length >= 2 && remaining[0] === firstChar) {
      // Partial reduplication detected
      return { stem: remaining, reduplicated: true };
    }
  }

  return { stem: lower, reduplicated: false };
}

/**
 * Tagalog morphological normalizer.
 */
export class TagalogMorphologicalNormalizer implements MorphologicalNormalizer {
  readonly language = 'tl';

  /**
   * Check if a word might be a Tagalog word that can be normalized.
   */
  isNormalizable(word: string): boolean {
    if (!containsTagalog(word)) return false;
    // Tagalog roots are typically at least 2 characters
    if (word.length < 2) return false;
    return true;
  }

  /**
   * Normalize a Tagalog word by stripping affixes.
   */
  normalize(word: string): NormalizationResult {
    let stem = word.toLowerCase();
    let confidence = 1.0;
    const removedPrefixes: string[] = [];
    const removedSuffixes: string[] = [];
    const appliedRules: string[] = [];

    // Step 1: Try combined prefixes first (longest match)
    for (const rule of COMBINED_PREFIXES) {
      if (stem.startsWith(rule.pattern)) {
        const remaining = stem.slice(rule.pattern.length);
        const minLen = rule.minRemaining ?? 2;
        if (remaining.length >= minLen) {
          stem = remaining;
          confidence -= rule.confidencePenalty;
          removedPrefixes.push(rule.pattern);
          appliedRules.push(`prefix:${rule.pattern}`);
          break; // Only one combined prefix
        }
      }
    }

    // Step 2: Try single prefixes (if no combined prefix was found)
    if (removedPrefixes.length === 0) {
      for (const rule of SINGLE_PREFIXES) {
        if (stem.startsWith(rule.pattern)) {
          const remaining = stem.slice(rule.pattern.length);
          const minLen = rule.minRemaining ?? 2;
          if (remaining.length >= minLen) {
            stem = remaining;
            confidence -= rule.confidencePenalty;
            removedPrefixes.push(rule.pattern);
            appliedRules.push(`prefix:${rule.pattern}`);
            break;
          }
        }
      }
    }

    // Step 3: Try reduplication stripping
    const redupResult = stripReduplication(stem);
    if (redupResult.reduplicated && redupResult.stem.length >= 2) {
      stem = redupResult.stem;
      confidence -= 0.1;
      appliedRules.push('reduplication:CV');
    }

    // Step 4: Try infix stripping
    const infixResult = stripInfix(stem);
    let infixStripped = false;
    if (infixResult && infixResult.stem.length >= 2) {
      stem = infixResult.stem;
      confidence -= 0.18;
      appliedRules.push(`infix:${infixResult.infix}`);
      infixStripped = true;
    }

    // Step 5: Try suffixes (but skip if we just stripped an infix to avoid double-stripping)
    // Example: "kinain" has -in- infix, result "kain" shouldn't have -in suffix stripped again
    if (!infixStripped) {
      for (const rule of SUFFIXES) {
        if (stem.endsWith(rule.pattern)) {
          const remaining = stem.slice(0, -rule.pattern.length);
          // Must leave a meaningful stem
          if (remaining.length >= 2) {
            stem = remaining;
            confidence -= rule.confidencePenalty;
            removedSuffixes.push(rule.pattern);
            appliedRules.push(`suffix:${rule.pattern}`);
            // Can have multiple suffixes, but stop after first match for now
            break;
          }
        }
      }
    }

    // Ensure confidence stays reasonable
    confidence = Math.max(0.5, confidence);

    // If nothing was stripped, return unchanged
    if (removedPrefixes.length === 0 && removedSuffixes.length === 0 && appliedRules.length === 0) {
      return noChange(word);
    }

    return normalized(stem, confidence, {
      removedPrefixes,
      removedSuffixes,
      appliedRules,
    });
  }
}

// Export singleton instance
export const tagalogMorphologicalNormalizer = new TagalogMorphologicalNormalizer();
