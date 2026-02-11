/**
 * Bengali Morphological Normalizer
 *
 * Reduces Bengali verb conjugations to their infinitive forms.
 * Bengali verbs follow regular suffix-based conjugation patterns:
 * - Infinitive: -া (করা - to do)
 * - Imperative: -ো, -ুন (করো, করুন - do!)
 * - Present: -ে, -েছ, -েছে, -েছেন (করে, করেছ, করেছে, করেছেন - does/has done)
 * - Past: -লো, -ল, -লেন (করলো, করল, করলেন - did)
 * - Future: -বে, -বেন, -বো (করবে, করবেন, করবো - will do)
 *
 * Key features:
 * - Similar grammatical structure to Hindi (both Indo-Aryan)
 * - Bengali script (U+0980-U+09FF)
 * - Regular conjugation patterns for all verb stems
 * - Politeness levels in imperative and formal forms
 *
 * Examples:
 *   টগল → টগল (infinitive already, no suffix)
 *   যোগ → যোগ (stem form)
 *   দেখাচ্ছে → দেখা (present progressive)
 *   পরিবর্তন → পরিবর্তন (stem form)
 */

import type { MorphologicalNormalizer, NormalizationResult, ConjugationType } from './types';
import { noChange, normalized } from './types';

/**
 * Check if a word looks like a Bengali verb.
 */
function looksLikeBengaliVerb(word: string): boolean {
  // Check for Bengali script (U+0980-U+09FF)
  return /[\u0980-\u09FF]/u.test(word);
}

/**
 * Suffix rules for Bengali verb conjugation.
 * Ordered by length (longest first) to prevent premature matches.
 */
const SUFFIX_RULES: readonly {
  suffix: string;
  replacement: string;
  confidence: number;
  type: ConjugationType;
  minStemLength?: number;
}[] = [
  // Present progressive with auxiliary (longest first)
  { suffix: 'চ্ছে আছে', replacement: '', confidence: 0.82, type: 'progressive', minStemLength: 1 },
  { suffix: 'চ্ছ আছি', replacement: '', confidence: 0.82, type: 'progressive', minStemLength: 1 },
  {
    suffix: 'চ্ছেন আছেন',
    replacement: '',
    confidence: 0.82,
    type: 'progressive',
    minStemLength: 1,
  },

  // Present perfect (longer forms first)
  { suffix: 'েছেন', replacement: '', confidence: 0.85, type: 'present', minStemLength: 1 },
  { suffix: 'েছে', replacement: '', confidence: 0.85, type: 'present', minStemLength: 1 },
  { suffix: 'েছ', replacement: '', confidence: 0.85, type: 'present', minStemLength: 1 },

  // Future tense
  { suffix: 'বেন', replacement: '', confidence: 0.85, type: 'future', minStemLength: 1 },
  { suffix: 'বে', replacement: '', confidence: 0.85, type: 'future', minStemLength: 1 },
  { suffix: 'বো', replacement: '', confidence: 0.85, type: 'future', minStemLength: 1 },

  // Past tense
  { suffix: 'লেন', replacement: '', confidence: 0.85, type: 'past', minStemLength: 1 },
  { suffix: 'লো', replacement: '', confidence: 0.85, type: 'past', minStemLength: 1 },
  { suffix: 'ল', replacement: '', confidence: 0.85, type: 'past', minStemLength: 2 },

  // Imperative forms
  { suffix: 'ুন', replacement: '', confidence: 0.85, type: 'imperative', minStemLength: 1 },
  { suffix: 'ো', replacement: '', confidence: 0.85, type: 'imperative', minStemLength: 1 },

  // Progressive forms (without auxiliary)
  { suffix: 'চ্ছে', replacement: '', confidence: 0.82, type: 'progressive', minStemLength: 1 },
  { suffix: 'চ্ছ', replacement: '', confidence: 0.82, type: 'progressive', minStemLength: 1 },
  { suffix: 'চ্ছি', replacement: '', confidence: 0.82, type: 'progressive', minStemLength: 1 },

  // Infinitive marker -া (dictionary form) - MUST come before single-char markers
  { suffix: 'া', replacement: '', confidence: 0.9, type: 'dictionary', minStemLength: 1 },

  // Present simple forms
  { suffix: 'ে', replacement: '', confidence: 0.85, type: 'present', minStemLength: 2 },
  { suffix: 'ি', replacement: '', confidence: 0.85, type: 'present', minStemLength: 2 },
  { suffix: 'ো', replacement: '', confidence: 0.85, type: 'present', minStemLength: 2 },
];

/**
 * Bengali morphological normalizer.
 */
export class BengaliMorphologicalNormalizer implements MorphologicalNormalizer {
  readonly language = 'bn';

  /**
   * Check if a word might be a Bengali verb that can be normalized.
   */
  isNormalizable(word: string): boolean {
    if (word.length < 2) return false;
    return looksLikeBengaliVerb(word);
  }

  /**
   * Normalize a Bengali word to its stem form.
   */
  normalize(word: string): NormalizationResult {
    // Try suffix-based normalization
    const conjugationResult = this.tryConjugationNormalization(word);
    if (conjugationResult) return conjugationResult;

    // No normalization needed
    return noChange(word);
  }

  /**
   * Try to normalize a conjugated verb to its stem.
   */
  private tryConjugationNormalization(word: string): NormalizationResult | null {
    for (const rule of SUFFIX_RULES) {
      if (word.endsWith(rule.suffix)) {
        // Use Array.from to handle multi-byte characters correctly
        const wordChars = Array.from(word);
        const suffixChars = Array.from(rule.suffix);
        const stemChars = wordChars.slice(0, wordChars.length - suffixChars.length);
        const stem = stemChars.join('') + rule.replacement;

        // Enforce minimum stem length (count grapheme clusters, not bytes)
        const minLength = rule.minStemLength ?? 1;
        if (stemChars.length < minLength) continue;

        // Must still contain Bengali characters (or be explicitly empty replacement)
        if (stem.length > 0 && !looksLikeBengaliVerb(stem)) continue;

        return normalized(stem, rule.confidence, {
          removedSuffixes: [rule.suffix],
          conjugationType: rule.type,
        });
      }
    }

    return null;
  }
}

// Export singleton instance
export const bengaliMorphologicalNormalizer = new BengaliMorphologicalNormalizer();
