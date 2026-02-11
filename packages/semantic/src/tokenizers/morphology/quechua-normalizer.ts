/**
 * Quechua Morphological Normalizer
 *
 * Quechua (Runasimi) is an agglutinative language of the Andes with:
 * - SOV word order
 * - Extensive suffix chains (verb + tense + person + evidential + subordinator)
 * - No gender or articles
 * - Postpositions as suffixes
 *
 * Common verb suffixes:
 * - Infinitive: -y (ruray = to do)
 * - Causative: -chiy/-chiq (ruraychiy = to make do)
 * - Reflexive: -ku (rurakuy = to do for oneself)
 * - Past: -rqa/-rqan (rurarqa = did)
 * - Progressive: -sha/-shan (rurashanchik = we are doing)
 * - Obligative: -na (rurana = must do)
 * - Potential: -man (rurayman = I could do)
 *
 * Person markers (after tense):
 * - 1sg: -ni (rurani = I do)
 * - 2sg: -nki (ruranki = you do)
 * - 3sg: -n (ruran = he/she does)
 * - 1pl: -nchik/-yku (ruranchik/rurayku = we do)
 * - 2pl: -nkichik (rurankichik = you all do)
 * - 3pl: -nku (ruranku = they do)
 *
 * Examples:
 *   t'ikraychiy → t'ikray (causative: to make toggle)
 *   yapaykuy → yapay (reflexive: to add for oneself)
 *   rurarqan → ruray (past + 3sg: he/she did)
 *   churashani → churay (progressive + 1sg: I am putting)
 */

import type {
  MorphologicalNormalizer,
  NormalizationResult,
  SuffixRule,
  ConjugationType,
} from './types';
import { noChange, normalized } from './types';

/**
 * Check if a character is a Quechua letter.
 * Quechua uses Latin alphabet with special glottal stop apostrophe.
 */
function isQuechuaLetter(char: string): boolean {
  const code = char.charCodeAt(0);
  // Basic Latin letters
  if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)) {
    return true;
  }
  // Quechua special characters: ñ, apostrophe
  return char === 'ñ' || char === 'Ñ' || char === "'" || char === "'";
}

/**
 * Check if a word contains Quechua characters.
 */
function containsQuechua(word: string): boolean {
  for (const char of word) {
    if (isQuechuaLetter(char)) return true;
  }
  return false;
}

/**
 * Suffix rules for Quechua verb conjugation.
 * Ordered by length (longest first) for greedy matching.
 *
 * Quechua agglutination example:
 * rurachishankichikmi = rura-chi-sha-nki-chik-mi
 * (do-CAUS-PROG-2sg-2pl-AFFIRM = "you all are making [someone] do")
 */
const QUECHUA_SUFFIX_RULES: readonly SuffixRule[] = [
  // Compound: progressive + person markers (longest first)
  { pattern: 'shankichik', confidence: 0.8, conjugationType: 'progressive', minStemLength: 2 },
  { pattern: 'shaniku', confidence: 0.8, conjugationType: 'progressive', minStemLength: 2 },
  { pattern: 'shanki', confidence: 0.82, conjugationType: 'progressive', minStemLength: 2 },
  { pattern: 'shani', confidence: 0.82, conjugationType: 'progressive', minStemLength: 2 },
  { pattern: 'shanchik', confidence: 0.82, conjugationType: 'progressive', minStemLength: 2 },
  { pattern: 'shanku', confidence: 0.82, conjugationType: 'progressive', minStemLength: 2 },
  { pattern: 'shan', confidence: 0.82, conjugationType: 'progressive', minStemLength: 2 },

  // Past + person markers
  { pattern: 'rqankichik', confidence: 0.8, conjugationType: 'past', minStemLength: 2 },
  { pattern: 'rqaniku', confidence: 0.8, conjugationType: 'past', minStemLength: 2 },
  { pattern: 'rqanki', confidence: 0.82, conjugationType: 'past', minStemLength: 2 },
  { pattern: 'rqani', confidence: 0.82, conjugationType: 'past', minStemLength: 2 },
  { pattern: 'rqanchik', confidence: 0.82, conjugationType: 'past', minStemLength: 2 },
  { pattern: 'rqanku', confidence: 0.82, conjugationType: 'past', minStemLength: 2 },
  { pattern: 'rqan', confidence: 0.85, conjugationType: 'past', minStemLength: 2 },

  // Future/potential + person markers (-nqa-)
  { pattern: 'nqankichik', confidence: 0.8, conjugationType: 'future', minStemLength: 2 },
  { pattern: 'nqaniku', confidence: 0.8, conjugationType: 'future', minStemLength: 2 },
  { pattern: 'nqanki', confidence: 0.82, conjugationType: 'future', minStemLength: 2 },
  { pattern: 'nqani', confidence: 0.82, conjugationType: 'future', minStemLength: 2 },
  { pattern: 'nqanchik', confidence: 0.82, conjugationType: 'future', minStemLength: 2 },
  { pattern: 'nqanku', confidence: 0.82, conjugationType: 'future', minStemLength: 2 },
  { pattern: 'nqa', confidence: 0.85, conjugationType: 'future', minStemLength: 2 },

  // Causative + reflexive compound (-chiku-)
  { pattern: 'chikuy', confidence: 0.8, conjugationType: 'compound', minStemLength: 2 },
  { pattern: 'chiku', confidence: 0.82, conjugationType: 'compound', minStemLength: 2 },

  // Causative variants (these leave infinitive -y suffix)
  {
    pattern: 'chiy',
    confidence: 0.85,
    conjugationType: 'causative',
    minStemLength: 2,
    replacement: 'y',
  },
  {
    pattern: 'chiq',
    confidence: 0.85,
    conjugationType: 'causative',
    minStemLength: 2,
    replacement: 'y',
  },
  { pattern: 'chi', confidence: 0.82, conjugationType: 'causative', minStemLength: 2 },

  // Reflexive/benefactive (shorter patterns must come after person markers below)
  { pattern: 'kuy', confidence: 0.82, conjugationType: 'reflexive', minStemLength: 2 },

  // Past tense
  { pattern: 'rqa', confidence: 0.85, conjugationType: 'past', minStemLength: 2 },
  { pattern: 'rqan', confidence: 0.85, conjugationType: 'past', minStemLength: 2 },

  // Progressive (present continuous)
  { pattern: 'sha', confidence: 0.82, conjugationType: 'progressive', minStemLength: 2 },

  // Obligative (must/should) - often used for infinitive sense
  { pattern: 'na', confidence: 0.85, conjugationType: 'obligation', minStemLength: 2 },

  // Potential/conditional (-man)
  { pattern: 'manmi', confidence: 0.8, conjugationType: 'potential', minStemLength: 2 },
  { pattern: 'man', confidence: 0.8, conjugationType: 'potential', minStemLength: 2 },

  // Person markers (present tense - after stripping progressive/other)
  { pattern: 'nkichik', confidence: 0.8, conjugationType: 'present', minStemLength: 2 },
  { pattern: 'niku', confidence: 0.8, conjugationType: 'present', minStemLength: 2 },
  { pattern: 'nki', confidence: 0.82, conjugationType: 'present', minStemLength: 2 },
  { pattern: 'nchik', confidence: 0.82, conjugationType: 'present', minStemLength: 2 },
  { pattern: 'nku', confidence: 0.82, conjugationType: 'present', minStemLength: 2 },
  { pattern: 'ni', confidence: 0.85, conjugationType: 'present', minStemLength: 2 },

  // Reflexive/benefactive (must come after -nku to avoid false matches)
  { pattern: 'ku', confidence: 0.82, conjugationType: 'reflexive', minStemLength: 2 },

  // Imperative (command form, 2nd person)
  { pattern: 'ychik', confidence: 0.82, conjugationType: 'imperative', minStemLength: 2 },
  { pattern: 'y', confidence: 0.9, conjugationType: 'dictionary', minStemLength: 2 }, // Infinitive

  // Passive voice (-sqa, -ska)
  { pattern: 'sqa', confidence: 0.82, conjugationType: 'passive', minStemLength: 2 },
  { pattern: 'ska', confidence: 0.82, conjugationType: 'passive', minStemLength: 2 },

  // Postposition suffixes (case markers) - low confidence since can attach to nouns
  { pattern: 'kama', confidence: 0.7, conjugationType: 'dictionary', minStemLength: 2 },
  { pattern: 'manta', confidence: 0.7, conjugationType: 'dictionary', minStemLength: 2 },
  { pattern: 'man', confidence: 0.7, conjugationType: 'dictionary', minStemLength: 2 },
  { pattern: 'wan', confidence: 0.7, conjugationType: 'dictionary', minStemLength: 2 },
  { pattern: 'pi', confidence: 0.7, conjugationType: 'dictionary', minStemLength: 2 },
  { pattern: 'ta', confidence: 0.7, conjugationType: 'dictionary', minStemLength: 2 },
];

/**
 * Quechua morphological normalizer.
 */
export class QuechuaMorphologicalNormalizer implements MorphologicalNormalizer {
  readonly language = 'qu';

  /**
   * Check if a word might be a Quechua verb that can be normalized.
   */
  isNormalizable(word: string): boolean {
    // Must contain Quechua characters
    if (!containsQuechua(word)) return false;

    // Must be at least 3 characters (Quechua verb stems are usually 2+ chars)
    if (word.length < 3) return false;

    // Must contain typical Quechua vowels (a, i, u) - not just English e/o
    // This helps filter out English words
    const hasQuechuaVowel = /[aiu]/.test(word.toLowerCase());
    if (!hasQuechuaVowel) return false;

    return true;
  }

  /**
   * Normalize a Quechua word to its stem form.
   */
  normalize(word: string): NormalizationResult {
    // Convert to lowercase for matching
    const lowerWord = word.toLowerCase();

    // Try suffix rules
    for (const rule of QUECHUA_SUFFIX_RULES) {
      if (lowerWord.endsWith(rule.pattern)) {
        let stem = lowerWord.slice(0, -rule.pattern.length);

        // Apply replacement if specified (e.g., causative -chiy -> -y)
        // Only add if stem doesn't already end with the replacement
        if (rule.replacement && !stem.endsWith(rule.replacement)) {
          stem = stem + rule.replacement;
        }

        // Validate stem length
        const minLength = rule.minStemLength ?? 2;
        if (stem.length < minLength) continue;

        // Check if stem looks valid (not empty, has vowels)
        if (!this.isValidStem(stem)) continue;

        const metadata: { removedSuffixes: string[]; conjugationType?: ConjugationType } = {
          removedSuffixes: [rule.pattern],
        };
        if (rule.conjugationType) {
          metadata.conjugationType = rule.conjugationType;
        }
        return normalized(stem, rule.confidence, metadata);
      }
    }

    // No normalization needed
    return noChange(word);
  }

  /**
   * Check if a stem looks like a valid Quechua verb stem.
   * Quechua verb stems typically:
   * - Have at least one vowel (a, e, i, o, u)
   * - End in a consonant or vowel
   * - Are at least 2 characters
   */
  private isValidStem(stem: string): boolean {
    if (stem.length < 2) return false;

    // Must contain at least one vowel
    const hasVowel = /[aeiou]/.test(stem);
    if (!hasVowel) return false;

    // Check that it's not just a postposition (these are usually short)
    const postpositions = new Set(['ta', 'man', 'pi', 'wan', 'pa', 'kama', 'hina']);
    if (postpositions.has(stem)) return false;

    return true;
  }
}

// Export singleton instance
export const quechuaMorphologicalNormalizer = new QuechuaMorphologicalNormalizer();
