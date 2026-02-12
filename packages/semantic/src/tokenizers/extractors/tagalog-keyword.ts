/**
 * Tagalog Keyword Extractor (Context-Aware)
 *
 * Handles Tagalog-specific identifier and keyword extraction with:
 * - Latin script (ASCII) character classification
 * - Space-separated words
 * - Morphological normalization (affix stripping)
 * - Case-insensitive keyword matching
 *
 * Tagalog has morphology (prefixes: mag-, nag-, um-; infixes: -um-; suffixes: -in, -an)
 * but is simpler than Spanish. The morphological normalizer handles verb conjugation.
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

/**
 * Check if character is ASCII letter or underscore (a-z, A-Z, _).
 */
function isAsciiLetter(char: string): boolean {
  return /[a-zA-Z_]/.test(char);
}

/**
 * Check if character is ASCII identifier character (a-z, A-Z, 0-9, _).
 */
function isAsciiIdentifierChar(char: string): boolean {
  return /[a-zA-Z0-9_]/.test(char);
}

/**
 * Tagalog prepositions that mark grammatical roles.
 */
const PREPOSITIONS = new Set([
  'sa', // at, in, on, to
  'ng', // of, possessive marker
  'para', // for
  'mula', // from
  'hanggang', // until
  'gaya', // like
  'tulad', // like, similar to
  'kasama', // with
  'para sa', // for (two words but treated as unit)
]);

/**
 * TagalogKeywordExtractor - Context-aware extractor for Tagalog identifiers and keywords.
 */
export class TagalogKeywordExtractor implements ContextAwareExtractor {
  readonly name = 'tagalog-keyword';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return isAsciiLetter(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('TagalogKeywordExtractor: context not set');
    }

    let pos = position;
    let word = '';

    // Extract word (Latin characters only)
    while (pos < input.length && isAsciiIdentifierChar(input[pos])) {
      word += input[pos++];
    }

    if (!word) return null;

    // Tagalog keywords are case-insensitive
    const lower = word.toLowerCase();

    // Check if it's a preposition
    const isPreposition = PREPOSITIONS.has(lower);

    // Look up keyword entry
    const keywordEntry = this.context.lookupKeyword(lower);
    const normalized =
      keywordEntry && keywordEntry.normalized !== keywordEntry.native
        ? keywordEntry.normalized
        : undefined;

    // Try morphological normalization if available and not already a keyword
    let morphNormalized: string | undefined;
    if (!keywordEntry && this.context.normalizer) {
      const morphResult = this.context.normalizer.normalize(word);
      if (morphResult.stem !== word && morphResult.confidence >= 0.7) {
        // Check if the stem is a known keyword
        const stemEntry = this.context.lookupKeyword(morphResult.stem);
        if (stemEntry) {
          morphNormalized = stemEntry.normalized;
        }
      }
    }

    return {
      value: word,
      length: word.length,
      metadata: {
        normalized: normalized || morphNormalized,
        isPreposition,
      },
    };
  }
}

/**
 * Create Tagalog-specific extractors.
 */
export function createTagalogExtractors(): ContextAwareExtractor[] {
  return [new TagalogKeywordExtractor()];
}
