/**
 * Hindi Morphological Normalizer
 *
 * Reduces Hindi verb conjugations to their infinitive forms.
 * Hindi verbs follow regular suffix-based conjugation patterns:
 * - Infinitive: -ना (करना - to do)
 * - Imperative: -ो, -ें (करो, करें - do!)
 * - Habitual present: -ता, -ती, -ते (करता है - does)
 * - Past: -ा, -ी, -े (किया - did)
 * - Future: -ूंगा, -ेगा, -ेगी (करूंगा, करेगा, करेगी - will do)
 * - Progressive: -रहा, -रही (कर रहा है - is doing)
 *
 * Key features:
 * - Gender marking in suffixes (masculine/feminine/plural)
 * - Regular conjugation patterns for all verb stems
 * - Progressive auxiliary handling (-रहा/-रही)
 * - Politeness levels in imperative forms
 *
 * Examples:
 *   टॉगल → टॉगल (infinitive already, no suffix)
 *   जोड़ता → जोड़ (habitual masculine)
 *   दिखाई → दिखा (past feminine)
 *   बदलेगा → बदल (future masculine)
 *   कर रहा → कर (progressive masculine)
 */

import type { MorphologicalNormalizer, NormalizationResult, ConjugationType } from './types';
import { noChange, normalized } from './types';

/**
 * Check if a word looks like a Hindi verb.
 */
function looksLikeHindiVerb(word: string): boolean {
  // Check for Devanagari script (U+0900-U+097F, U+A8E0-U+A8FF)
  return /[\u0900-\u097F\u0A8E-\u0A8F]/u.test(word);
}

/**
 * Suffix rules for Hindi verb conjugation.
 * Ordered by length (longest first) to prevent premature matches.
 */
const SUFFIX_RULES: readonly {
  suffix: string;
  replacement: string;
  confidence: number;
  type: ConjugationType;
  minStemLength?: number;
}[] = [
  // Progressive forms (longest first)
  { suffix: ' रहा है', replacement: '', confidence: 0.82, type: 'progressive', minStemLength: 1 },
  { suffix: ' रही है', replacement: '', confidence: 0.82, type: 'progressive', minStemLength: 1 },
  { suffix: ' रहे हैं', replacement: '', confidence: 0.82, type: 'progressive', minStemLength: 1 },
  { suffix: 'रहा', replacement: '', confidence: 0.82, type: 'progressive', minStemLength: 1 },
  { suffix: 'रही', replacement: '', confidence: 0.82, type: 'progressive', minStemLength: 1 },
  { suffix: 'रहे', replacement: '', confidence: 0.82, type: 'progressive', minStemLength: 1 },

  // Future tense (longest first)
  { suffix: 'ूंगा', replacement: '', confidence: 0.85, type: 'future', minStemLength: 1 },
  { suffix: 'ूंगी', replacement: '', confidence: 0.85, type: 'future', minStemLength: 1 },
  { suffix: 'ेगा', replacement: '', confidence: 0.85, type: 'future', minStemLength: 1 },
  { suffix: 'ेगी', replacement: '', confidence: 0.85, type: 'future', minStemLength: 1 },
  { suffix: 'ेंगे', replacement: '', confidence: 0.85, type: 'future', minStemLength: 1 },

  // Habitual present (longest first)
  { suffix: 'ता है', replacement: '', confidence: 0.85, type: 'present', minStemLength: 1 },
  { suffix: 'ती है', replacement: '', confidence: 0.85, type: 'present', minStemLength: 1 },
  { suffix: 'ते हैं', replacement: '', confidence: 0.85, type: 'present', minStemLength: 1 },
  { suffix: 'ता', replacement: '', confidence: 0.85, type: 'present', minStemLength: 1 },
  { suffix: 'ती', replacement: '', confidence: 0.85, type: 'present', minStemLength: 1 },
  { suffix: 'ते', replacement: '', confidence: 0.85, type: 'present', minStemLength: 1 },

  // Infinitive marker -ना (dictionary form) - MUST come before single-char past tense markers
  { suffix: 'ना', replacement: '', confidence: 0.9, type: 'dictionary', minStemLength: 1 },

  // Past tense (longer forms first)
  { suffix: 'ाया', replacement: '', confidence: 0.82, type: 'past', minStemLength: 1 },
  { suffix: 'ायी', replacement: '', confidence: 0.82, type: 'past', minStemLength: 1 },
  { suffix: 'ाये', replacement: '', confidence: 0.82, type: 'past', minStemLength: 1 },
  { suffix: 'या', replacement: '', confidence: 0.82, type: 'past', minStemLength: 1 },
  { suffix: 'िये', replacement: '', confidence: 0.85, type: 'imperative', minStemLength: 1 },
  { suffix: 'िए', replacement: '', confidence: 0.85, type: 'imperative', minStemLength: 1 },
  { suffix: 'ई', replacement: '', confidence: 0.82, type: 'past', minStemLength: 1 },
  { suffix: 'ए', replacement: '', confidence: 0.82, type: 'past', minStemLength: 1 },
  { suffix: 'ें', replacement: '', confidence: 0.85, type: 'imperative', minStemLength: 1 },
  { suffix: 'ो', replacement: '', confidence: 0.85, type: 'imperative', minStemLength: 1 },
  { suffix: 'ा', replacement: '', confidence: 0.82, type: 'past', minStemLength: 2 },
  { suffix: 'ी', replacement: '', confidence: 0.82, type: 'past', minStemLength: 2 },
  { suffix: 'े', replacement: '', confidence: 0.82, type: 'past', minStemLength: 2 },
];

/**
 * Hindi morphological normalizer.
 */
export class HindiMorphologicalNormalizer implements MorphologicalNormalizer {
  readonly language = 'hi';

  /**
   * Check if a word might be a Hindi verb that can be normalized.
   */
  isNormalizable(word: string): boolean {
    if (word.length < 2) return false;
    return looksLikeHindiVerb(word);
  }

  /**
   * Normalize a Hindi word to its stem form.
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

        // Must still contain Hindi characters (or be explicitly empty replacement)
        if (stem.length > 0 && !looksLikeHindiVerb(stem)) continue;

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
export const hindiMorphologicalNormalizer = new HindiMorphologicalNormalizer();
